import postgres from 'npm:postgres@3.4.7';

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 4 });
const headers = {
  'Access-Control-Allow-Origin': 'https://nikverlid.github.io',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};
const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
const sha = async (value: string) => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const salt = () => hex(crypto.getRandomValues(new Uint8Array(24)));
async function passwordHash(password: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(secret), iterations: 210000 }, key, 256));
}
const clean = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ');
const publicUser = (u: any) => ({ id: u.id, login: u.login, name: u.name, class: u.class, role: u.role, must_change_password: !!u.must_change_password });
const fail = (message: string): never => { throw new Error(message); };
const allowedGames = ['truth', 'crossword'];
const gameNames: Record<string, string> = { truth: 'Правда или ложь', crossword: 'Кроссворд', wheel: 'Колесо фортуны', own: 'Своя игра', walk: 'Бродилка (старое задание)', quiz: 'Тест (старое задание)' };
function temporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}

function nextWednesday() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yekaterinburg', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value);
  const date = new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
  const delta = ((3 - date.getUTCDay() + 7) % 7) || 7;
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

async function rate(key: string, max: number) {
  const [row] = await sql`insert into biology.rate_limits(key,hits,until_at) values(${key},1,now()+interval '15 minutes')
    on conflict(key) do update set hits=case when biology.rate_limits.until_at<now() then 1 else biology.rate_limits.hits+1 end,
    until_at=case when biology.rate_limits.until_at<now() then now()+interval '15 minutes' else biology.rate_limits.until_at end returning hits`;
  if (row.hits > max) fail('Слишком много попыток. Подождите 15 минут.');
}

async function action(body: any, token: string, ip: string) {
  if (body.action === 'register' || body.action === 'login') {
    await rate(`ip:${ip}`, 150);
    const password = String(body.password ?? '');
    if (password.length > 128) fail('Пароль слишком длинный.');
    if (body.action === 'register') {
      const surname = clean(body.surname), first = clean(body.first), cls = String(body.class ?? '');
      if (!['5А', '5Б'].includes(cls) || surname.length < 2 || first.length < 2 || (surname + first).length > 100) fail('Проверьте имя, фамилию и класс.');
      if (password.length < 6) fail('Пароль должен содержать не менее 6 символов.');
      await rate(`registration:${ip}`, 12);
      const name = `${surname} ${first}`;
      const [account] = await sql.begin(async tx => {
        await tx`select pg_advisory_xact_lock(hashtextextended(${`register:${cls}`},0))`;
        const [{ count }] = await tx`select count(*)::int as count from biology.accounts where class=${cls} and role='student'`;
        if (count >= 20) fail(`В классе ${cls} уже зарегистрированы 20 учеников.`);
        const s = salt(), h = await passwordHash(password, s), login = `bio-${salt().slice(0, 12)}`;
        const [created] = await tx`insert into biology.accounts(login,name,class,role,password_hash,salt)
          values(${login},${name},${cls},'student',${h},${s}) returning *`;
        return [created];
      });
      const session = salt() + salt();
      await sql`insert into biology.sessions(token_hash,account_id,expires_at) values(${await sha(session)},${account.id},now()+interval '90 days')`;
      return { user: publicUser(account), token: session };
    }
    await rate(`login:${ip}`, 25);
    let users: any[];
    if (['teacher', 'admin'].includes(body.role)) users = await sql`select * from biology.accounts where role=${body.role}`;
    else {
      const name = `${clean(body.surname)} ${clean(body.first)}`;
      users = await sql`select * from biology.accounts where lower(name)=lower(${name}) and class=${String(body.class ?? '')} and role='student'`;
    }
    let account;
    for (const candidate of users) if (await passwordHash(password, candidate.salt) === candidate.password_hash) account = candidate;
    if (!account) fail('Неверные данные для входа.');
    const session = salt() + salt();
    await sql`insert into biology.sessions(token_hash,account_id,expires_at) values(${await sha(session)},${account.id},now()+interval '90 days')`;
    return { user: publicUser(account), token: session };
  }

  const tokenHash = await sha(token);
  const [u] = await sql`select a.* from biology.accounts a join biology.sessions s on s.account_id=a.id
    where s.token_hash=${tokenHash} and s.expires_at>now()`;
  if (!u) fail('Войдите в аккаунт заново.');
  const staff = ['teacher', 'admin'].includes(u.role);
  if (body.action === 'logout') { await sql`delete from biology.sessions where token_hash=${tokenHash}`; return { ok: true }; }
  if (u.must_change_password && body.action !== 'change_permanent_password') fail('Сначала задайте постоянный пароль.');
  if (body.action === 'change_permanent_password') {
    const password = String(body.password ?? ''), confirm = String(body.confirm ?? '');
    if (u.role !== 'student' || !u.must_change_password) fail('Смена постоянного пароля сейчас не требуется.');
    if (password.length < 6 || password.length > 128) fail('Пароль должен содержать от 6 до 128 символов.');
    if (password !== confirm) fail('Пароли не совпадают.');
    const s = salt(), h = await passwordHash(password, s);
    const [updated] = await sql`update biology.accounts set password_hash=${h},salt=${s},must_change_password=false where id=${u.id} returning *`;
    await sql`delete from biology.sessions where account_id=${u.id} and token_hash<>${tokenHash}`;
    return { ok: true, user: publicUser(updated) };
  }
  if (body.action === 'dashboard') {
    const homework = staff
      ? await sql`select h.*,a.name as assigned_by from biology.homework h left join biology.accounts a on a.id=h.created_by order by h.created_at desc`
      : await sql`select * from biology.homework where class=${u.class} and active order by due_date nulls last,created_at desc`;
    const results = staff
      ? await sql`select r.*,a.name as student_name,a.class,h.topic_id,h.game,h.class as homework_class,h.due_date
        from biology.results r join biology.accounts a on a.id=r.student_id join biology.homework h on h.id=r.homework_id
        order by r.created_at desc limit 300`
      : await sql`select r.*,h.topic_id,h.game,h.due_date from biology.results r join biology.homework h on h.id=r.homework_id
        where r.student_id=${u.id} order by r.created_at desc`;
    const students = staff ? await sql`select id,name,class,created_at from biology.accounts where role='student' order by class,name` : [];
    return { user: publicUser(u), homework, results, students, gameNames };
  }
  if (body.action === 'assign') {
    if (!staff) fail('Нет доступа.');
    const cls = String(body.class ?? ''), topic = Number(body.topic), game = String(body.game ?? '');
    if (!['5А', '5Б'].includes(cls) || !Number.isInteger(topic) || topic < 1 || topic > 27 || !allowedGames.includes(game)) fail('Проверьте класс, тему и игру.');
    const dueDate = cls === '5А' ? nextWednesday() : (body.due_date || null);
    const [created] = await sql`insert into biology.homework(class,topic_id,game,due_date,created_by)
      values(${cls},${topic},${game},${dueDate},${u.id}) returning *`;
    return { ok: true, homework: created };
  }
  if (body.action === 'toggle_homework') {
    if (!staff) fail('Нет доступа.');
    await sql`update biology.homework set active=${!!body.active} where id=${String(body.id)}`;
    return { ok: true };
  }
  if (body.action === 'submit_result') {
    if (u.role !== 'student') fail('Результат может отправить только ученик.');
    const homeworkId = String(body.homework_id ?? ''), topic = Number(body.topic_id), game = String(body.game ?? '');
    const score = Number(body.score), correct = Number(body.correct), wrong = Number(body.wrong);
    if (!allowedGames.includes(game) || !Number.isInteger(topic) || !Number.isFinite(score) || score < 0 || score > 100 || !Number.isInteger(correct) || correct < 0 || !Number.isInteger(wrong) || wrong < 0 || correct + wrong !== (game === 'truth' ? 20 : 10)) fail('Некорректный результат игры.');
    const [homework] = await sql`select * from biology.homework where id=${homeworkId} and class=${u.class} and active and topic_id=${topic} and game=${game}`;
    if (!homework) fail('Это задание не назначено вашему классу или уже закрыто.');
    const expectedScore = Math.round(correct / (correct + wrong) * 100);
    if (score !== expectedScore) fail('Результат не совпадает с числом верных ответов.');
    const [result] = await sql`insert into biology.results(homework_id,student_id,status,score,correct,wrong,started_at,completed_at)
      values(${homework.id},${u.id},'completed',${score},${correct},${wrong},now(),now())
      on conflict(homework_id,student_id) do update set
        score=greatest(biology.results.score,excluded.score),
        correct=case when excluded.score>=biology.results.score then excluded.correct else biology.results.correct end,
        wrong=case when excluded.score>=biology.results.score then excluded.wrong else biology.results.wrong end,
        status='completed',completed_at=now() returning *`;
    return { ok: true, result };
  }
  if (body.action === 'delete_student') {
    if (u.role !== 'admin') fail('Нет доступа.');
    await sql`delete from biology.accounts where id=${String(body.id)} and role='student'`;
    return { ok: true };
  }
  if (body.action === 'manage_student_password') {
    if (u.role !== 'admin') fail('Нет доступа.');
    const id = String(body.id ?? ''), mode = String(body.mode ?? '');
    const [student] = await sql`select * from biology.accounts where id=${id} and role='student'`;
    if (!student) fail('Ученик не найден.');
    let password = '';
    if (mode === 'temporary') password = temporaryPassword();
    else if (mode === 'permanent') {
      password = String(body.password ?? '');
      if (password.length < 6 || password.length > 128) fail('Пароль должен содержать от 6 до 128 символов.');
    } else fail('Неизвестный режим смены пароля.');
    const s = salt(), h = await passwordHash(password, s), mustChange = mode === 'temporary';
    await sql`update biology.accounts set password_hash=${h},salt=${s},must_change_password=${mustChange} where id=${id}`;
    await sql`delete from biology.sessions where account_id=${id}`;
    return mode === 'temporary' ? { ok: true, temporary_password: password } : { ok: true };
  }
  fail('Неизвестное действие.');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response('{}', { status: 405, headers });
  try {
    const raw = await req.text();
    if (raw.length > 10000) fail('Запрос слишком большой.');
    const body = JSON.parse(raw);
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const result = await action(body, token, ip);
    return new Response(JSON.stringify(result), { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось выполнить запрос.';
    return new Response(JSON.stringify({ error: message }), { status: 400, headers });
  }
});
