(() => {
  const config = window.BIOLOGY_CONFIG;
  const lessonData = typeof LESSONS !== 'undefined' ? LESSONS : [];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stored = (() => { try { return JSON.parse(localStorage.getItem('biologyAccount') || 'null'); } catch { return null; } })();
  let session = stored?.token ? stored : null;
  let authRole = 'student';
  let dash = null;
  let busy = false;
  let adminNotice = null;

  const controls = document.createElement('div');
  controls.className = 'account-controls';
  document.querySelector('.topbar').append(controls);
  const modal = document.createElement('dialog');
  modal.className = 'account-dialog';
  modal.setAttribute('aria-labelledby', 'account-title');
  document.body.append(modal);

  async function api(action, data = {}) {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: config.apiKey, Authorization: `Bearer ${session?.token || ''}` },
      body: JSON.stringify({ action, ...data })
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || 'Не удалось выполнить запрос.');
    return result;
  }

  function header() {
    controls.innerHTML = session
      ? `<span class="account-name">${esc(session.user.name)}${session.user.class ? ` · ${esc(session.user.class)}` : ''}</span>${session.user.role === 'student' ? '<button class="account-button account-homework" data-open-dashboard>ДЗ</button>' : '<button class="account-button" data-open-dashboard>Кабинет</button>'}<button class="account-button account-quiet" data-logout>Выйти</button>`
      : '<button class="account-button" data-open-auth>Войти</button>';
  }

  function openAuth(mode = 'login') {
    authRole = 'student';
    drawAuth(mode);
    modal.showModal();
  }

  function drawAuth(mode = 'login', error = '') {
    modal.innerHTML = `<div class="account-shell"><button class="dialog-close" type="button" aria-label="Закрыть" data-close>×</button>
      <p class="eyebrow">Биология · 5 класс</p><h2 id="account-title">${mode === 'register' ? 'Регистрация ученика' : 'Вход в аккаунт'}</h2>
      <div class="account-tabs" role="tablist" aria-label="Тип аккаунта">
        <button type="button" data-role="student" class="${authRole === 'student' ? 'selected' : ''}">Ученик</button>
        ${mode === 'register' ? '' : `<button type="button" data-role="teacher" class="${authRole === 'teacher' ? 'selected' : ''}">Учитель</button><button type="button" data-role="admin" class="${authRole === 'admin' ? 'selected' : ''}">Администратор</button>`}
      </div>
      ${mode === 'register' ? `<form id="account-form" class="account-form"><label>Фамилия<input name="surname" required minlength="2" autocomplete="family-name"></label><label>Имя<input name="first" required minlength="2" autocomplete="given-name"></label><label>Класс<select name="class" required><option value="5А">5А</option><option value="5Б">5Б</option></select></label><label>Придумай свой пароль<input name="password" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label><p class="form-hint">При регистрации ученик сам задаёт пароль. Если он забудет его, администратор сможет выдать временный пароль для восстановления доступа. В каждом классе можно зарегистрировать не более 20 учеников.</p><button class="account-primary" type="submit">Зарегистрироваться</button></form>` : `<form id="account-form" class="account-form">${authRole === 'student' ? '<label>Фамилия<input name="surname" required autocomplete="family-name"></label><label>Имя<input name="first" required autocomplete="given-name"></label><label>Класс<select name="class"><option value="5А">5А</option><option value="5Б">5Б</option></select></label>' : ''}<label>Пароль<input name="password" type="password" required maxlength="128" autocomplete="current-password"></label><button class="account-primary" type="submit">Войти</button></form>`}
      ${error ? `<p class="account-error" role="alert">${esc(error)}</p>` : ''}<p class="account-switch">${mode === 'register' ? 'Уже зарегистрированы? <button type="button" data-mode="login">Войти</button>' : authRole === 'student' ? 'Нет аккаунта? <button type="button" data-mode="register">Зарегистрироваться</button>' : ''}</p>
    </div>`;
    modal.querySelector('[data-close]')?.addEventListener('click', () => modal.close());
    modal.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => { authRole = button.dataset.role; drawAuth(mode); }));
    modal.querySelector('[data-mode]')?.addEventListener('click', () => drawAuth(modal.querySelector('[data-mode]').dataset.mode));
    modal.querySelector('#account-form')?.addEventListener('submit', submitAuth);
  }

  async function submitAuth(event) {
    event.preventDefault();
    if (busy) return;
    busy = true;
    const form = new FormData(event.currentTarget);
    const isRegistration = modal.querySelector('[data-mode]')?.dataset.mode === 'login' && modal.querySelector('#account-title')?.textContent === 'Регистрация ученика';
    const details = Object.fromEntries(form.entries());
    try {
      const result = await api(isRegistration ? 'register' : 'login', isRegistration ? details : { ...details, role: authRole });
      session = { token: result.token, user: result.user };
      localStorage.setItem('biologyAccount', JSON.stringify(session));
      dash = null;
      header();
      if (session.user.must_change_password) {
        drawRequiredPassword();
        return;
      }
      modal.close();
      if (location.hash.startsWith('#lesson-')) renderGameGate();
      await openDashboard();
    } catch (error) {
      drawAuth(isRegistration ? 'register' : 'login', error.message);
    } finally { busy = false; }
  }

  function drawRequiredPassword(error = '') {
    modal.innerHTML = `<div class="account-shell"><p class="eyebrow">Восстановление доступа</p><h2 id="account-title">Задай новый постоянный пароль</h2><p>Администратор выдал временный пароль, потому что прежний был забыт. Придумай собственный постоянный пароль длиной от 6 символов.</p><form id="permanent-password-form" class="account-form"><label>Новый пароль<input name="password" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label><label>Повтори пароль<input name="confirm" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label><button class="account-primary" type="submit">Сохранить пароль</button></form>${error ? `<p class="account-error" role="alert">${esc(error)}</p>` : ''}</div>`;
    modal.querySelector('#permanent-password-form')?.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy) return;
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (data.password !== data.confirm) { drawRequiredPassword('Пароли не совпадают.'); return; }
      busy = true;
      try {
        const result = await api('change_permanent_password', data);
        session.user = result.user;
        localStorage.setItem('biologyAccount', JSON.stringify(session));
        modal.close();
        await openDashboard();
      } catch (error) { drawRequiredPassword(error.message); }
      finally { busy = false; }
    });
  }

  modal.addEventListener('close', () => { adminNotice = null; });

  function formatDate(value) {
    if (!value) return 'Дата урока для этого класса пока не задана';
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Asia/Yekaterinburg' }).format(date);
  }

  function todayLocal() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yekaterinburg', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
  }

  function lessonTitle(id) { return lessonData[Number(id) - 1]?.title || `Тема ${id}`; }
  function gamesLabel(game) { return dash?.gameNames?.[game] || ({ truth: 'Правда или ложь', crossword: 'Кроссворд', wheel: 'Колесо фортуны', own: 'Своя игра', walk: 'Бродилка', quiz: 'Тест' }[game] || 'Игра'); }

  function studentDashboard() {
    const homes = (dash.homework || []).filter(h => h.active);
    const upcoming = homes.find(h => !h.due_date || h.due_date >= todayLocal()) || homes[0];
    const results = dash.results || [];
    return `<section class="account-dashboard student-dashboard"><div class="dash-heading"><div><p class="eyebrow">Ученический кабинет · ${esc(session.user.class)}</p><h2>Домашние задания</h2><p>Темы курса доступны всем. Игры запускаются в теме после назначения учителем.</p></div><button class="account-button account-quiet" data-close>Закрыть</button></div>
      <div class="dash-grid"><article class="dash-card dash-next"><span class="dash-label">Ближайшее ДЗ</span>${upcoming ? `<h3>${esc(gamesLabel(upcoming.game))}</h3><p>Тема ${upcoming.topic_id}: ${esc(lessonTitle(upcoming.topic_id))}</p><p class="due-date">Ближайший урок: ${esc(formatDate(upcoming.due_date))}</p><a class="account-primary link-button" href="#lesson-${upcoming.topic_id}" data-go-lesson>Открыть тему</a><p class="form-hint">Игру можно запустить в теме после назначения учителем.</p>` : '<h3>Пока нет назначенных заданий</h3><p>Когда учитель задаст игру, она появится в этом разделе.</p>'}</article>
      <article class="dash-card"><span class="dash-label">Расписание</span>${session.user.class === '5А' ? '<h3>Биология — каждую среду</h3><p>Домашнее задание привязано к ближайшему уроку.</p>' : '<h3>5Б</h3><p>Дни уроков для этого класса пока не указаны.</p>'}</article></div>
      <section class="dash-section"><h3>Все задания</h3>${homes.length ? `<div class="assignment-list">${homes.map(h => `<article class="assignment-row"><div><strong>${esc(gamesLabel(h.game))}</strong><span>§ ${h.topic_id} · ${esc(lessonTitle(h.topic_id))}</span></div><span>${esc(formatDate(h.due_date))}</span><a href="#lesson-${h.topic_id}" data-go-lesson>Тема</a></article>`).join('')}</div>` : '<p class="empty-state">Назначенных заданий пока нет.</p>'}</section>
      <section class="dash-section"><h3>Результаты</h3>${results.length ? `<div class="assignment-list">${results.map(r => `<article class="assignment-row"><div><strong>§ ${r.topic_id}: ${esc(lessonTitle(r.topic_id))}</strong><span>${esc(gamesLabel(r.game))}</span></div><span>${r.score == null ? 'Ожидает игры' : `${Number(r.score)}%`}</span><span>${esc(r.status)}</span></article>`).join('')}</div>` : '<p class="empty-state">Результатов пока нет. Они появятся после выполнения первых игр.</p>'}</section></section>`;
  }

  function teacherDashboard() {
    const classFilter = modal.querySelector('#dash-class')?.value || '5А';
    const homes = (dash.homework || []).filter(h => h.class === classFilter);
    const students = (dash.students || []).filter(s => s.class === classFilter);
    const results = (dash.results || []).filter(r => r.homework_class === classFilter);
    return `<section class="account-dashboard staff-dashboard"><div class="dash-heading"><div><p class="eyebrow">${session.user.role === 'admin' ? 'Администратор' : 'Учитель'} · биология</p><h2>${session.user.role === 'admin' ? 'Панель управления' : 'Кабинет учителя'}</h2></div><button class="account-button account-quiet" data-close>Закрыть</button></div>
      <div class="staff-tabs"><label>Класс<select id="dash-class"><option ${classFilter === '5А' ? 'selected' : ''}>5А</option><option ${classFilter === '5Б' ? 'selected' : ''}>5Б</option></select></label><span>Учеников: <b>${students.length} / 20</b></span></div>
      <div class="staff-columns"><section class="dash-card"><h3>Назначить игровое ДЗ</h3><p>Уже можно назначить «Правда или ложь» и кроссворд. Колесо фортуны и «Своя игра» появятся следующими.</p><form id="assign-form" class="account-form compact-form"><label>Тема<select name="topic">${lessonData.map((lesson, i) => `<option value="${i + 1}">§ ${i + 1} · ${esc(lesson.title)}</option>`).join('')}</select></label><label>Игра<select name="game"><option value="truth">Правда или ложь</option><option value="crossword">Кроссворд</option><option value="wheel" disabled>Колесо фортуны · скоро</option><option value="own" disabled>Своя игра · скоро</option></select></label><label class="class-b-date">Срок для 5Б<input type="date" name="due_date"></label><p class="form-hint">Для 5А срок автоматически устанавливается на ближайшую среду. Для 5Б можно указать дату вручную.</p><button class="account-primary" type="submit">Назначить ДЗ</button><p class="account-feedback" aria-live="polite"></p></form></section>
      <section class="dash-card"><h3>Ученики · ${esc(classFilter)}</h3>${session.user.role === 'admin' ? '<p class="form-hint">Ученики сами задают пароль при регистрации. Если ученик его забыл, здесь можно выдать временный пароль для восстановления или сразу установить новый постоянный.</p>' : ''}${session.user.role === 'admin' && adminNotice ? `<div class="admin-password-notice" role="status"><span>${esc(adminNotice.message)}</span>${adminNotice.password ? `<code>${esc(adminNotice.password)}</code><button class="account-button" type="button" data-copy-password>Копировать пароль</button>` : ''}</div>` : ''}${students.length ? `<div class="student-list">${students.map(s => `<div class="student-list-item"><span>${esc(s.name)}</span><div class="student-actions">${session.user.role === 'admin' ? `<button class="text-action" data-temp-password="${esc(s.id)}">Выдать временный пароль</button><button class="text-action" data-set-password="${esc(s.id)}">Задать постоянный пароль</button><button class="text-action" data-delete-student="${esc(s.id)}">Удалить</button>` : '<small>ученик</small>'}</div></div>`).join('')}</div>` : '<p class="empty-state">В этом классе пока никто не зарегистрировался.</p>'}</section></div>
      <section class="dash-section"><h3>Домашние задания · ${esc(classFilter)}</h3>${homes.length ? `<div class="assignment-list">${homes.map(h => `<article class="assignment-row"><div><strong>§ ${h.topic_id} · ${esc(lessonTitle(h.topic_id))}</strong><span>${esc(gamesLabel(h.game))} · назначено ${esc(formatDate(h.created_at?.slice(0, 10)))}</span></div><span>${esc(formatDate(h.due_date))}</span><button class="text-action" data-toggle-homework="${esc(h.id)}" data-active="${h.active}">${h.active ? 'Закрыть' : 'Открыть'}</button></article>`).join('')}</div>` : '<p class="empty-state">Заданий пока нет.</p>'}</section>
      <section class="dash-section"><h3>Результаты учеников</h3>${results.length ? `<div class="table-wrap account-results"><table><thead><tr><th>Ученик</th><th>Тема / игра</th><th>Результат</th><th>Статус</th></tr></thead><tbody>${results.map(r => `<tr><td>${esc(r.student_name)} · ${esc(r.class)}</td><td>§ ${r.topic_id} · ${esc(gamesLabel(r.game))}</td><td>${r.score == null ? '—' : `${Number(r.score)}%`}</td><td>${esc(r.status)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty-state">Результаты появятся здесь после того, как игры будут подключены и ученики начнут их проходить.</p>'}</section></section>`;
  }

  function drawDashboard() {
    const dashboard = session.user.role === 'student' ? studentDashboard() : teacherDashboard();
    modal.innerHTML = `<div class="account-shell dashboard-shell">${dashboard}</div>`;
    modal.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => modal.close()));
    modal.querySelectorAll('[data-go-lesson]').forEach(link => link.addEventListener('click', () => modal.close()));
    modal.querySelector('#dash-class')?.addEventListener('change', () => drawDashboard());
    modal.querySelector('#assign-form')?.addEventListener('submit', assignHomework);
    modal.querySelectorAll('[data-toggle-homework]').forEach(button => button.addEventListener('click', async () => {
      try { await api('toggle_homework', { id: button.dataset.toggleHomework, active: button.dataset.active !== 'true' }); await refreshDashboard(); }
      catch (error) { alert(error.message); }
    }));
    modal.querySelectorAll('[data-delete-student]').forEach(button => button.addEventListener('click', async () => {
      if (!confirm('Удалить аккаунт ученика и его результаты?')) return;
      try { await api('delete_student', { id: button.dataset.deleteStudent }); await refreshDashboard(); }
      catch (error) { alert(error.message); }
    }));
    modal.querySelector('[data-copy-password]')?.addEventListener('click', async button => {
      try { await navigator.clipboard.writeText(adminNotice.password); button.currentTarget.textContent = 'Скопировано'; }
      catch { button.currentTarget.textContent = 'Выдели пароль и скопируй'; }
    });
    modal.querySelectorAll('[data-temp-password]').forEach(button => button.addEventListener('click', async () => {
      const student = (dash.students || []).find(s => s.id === button.dataset.tempPassword);
      try {
        const result = await api('manage_student_password', { id: button.dataset.tempPassword, mode: 'temporary' });
        adminNotice = { message: `Временный пароль для ${student?.name || 'ученика'} (показывается только сейчас):`, password: result.temporary_password };
        await refreshDashboard();
      } catch (error) { alert(error.message); }
    }));
    modal.querySelectorAll('[data-set-password]').forEach(button => button.addEventListener('click', () => {
      const row = button.closest('.student-list-item');
      if (row.querySelector('.admin-password-form')) return;
      row.insertAdjacentHTML('beforeend', `<form class="admin-password-form" data-student-id="${esc(button.dataset.setPassword)}"><label>Новый постоянный пароль<input name="password" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label><label>Повтори пароль<input name="confirm" type="password" required minlength="6" maxlength="128" autocomplete="new-password"></label><button class="account-primary" type="submit">Сохранить</button><button class="text-action" type="button" data-cancel-password>Отмена</button><p class="account-feedback" aria-live="polite"></p></form>`);
      const form = row.querySelector('.admin-password-form');
      form.querySelector('[data-cancel-password]').addEventListener('click', () => form.remove());
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const feedback = form.querySelector('.account-feedback');
        if (data.password !== data.confirm) { feedback.textContent = 'Пароли не совпадают.'; return; }
        const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
        try {
          await api('manage_student_password', { id: form.dataset.studentId, mode: 'permanent', password: data.password });
          adminNotice = { message: `Постоянный пароль для ${studentName(button.dataset.setPassword)} установлен.` };
          await refreshDashboard();
        } catch (error) { feedback.textContent = error.message; submit.disabled = false; }
      });
    }));
  }

  function studentName(id) { return (dash?.students || []).find(s => s.id === id)?.name || 'ученика'; }

  async function assignHomework(event) {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button[type="submit"]');
    const feedback = event.currentTarget.querySelector('.account-feedback');
    button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      const cls = modal.querySelector('#dash-class').value;
      await api('assign', { ...data, class: cls, topic: Number(data.topic) });
      feedback.textContent = `Задание назначено классу ${cls}.`;
      await refreshDashboard();
    } catch (error) { feedback.textContent = error.message; }
    finally { button.disabled = false; }
  }

  async function refreshDashboard() {
    dash = await api('dashboard');
    drawDashboard();
  }

  async function openDashboard() {
    if (!session) return openAuth();
    modal.innerHTML = '<div class="account-shell"><p>Загружаю кабинет…</p></div>';
    if (!modal.open) modal.showModal();
    try { await refreshDashboard(); }
    catch (error) {
      if (/Войдите в аккаунт/.test(error.message)) { session = null; dash = null; localStorage.removeItem('biologyAccount'); header(); }
      modal.innerHTML = `<div class="account-shell"><button class="dialog-close" data-close aria-label="Закрыть">×</button><p class="account-error">${esc(error.message)}</p></div>`;
      modal.querySelector('[data-close]')?.addEventListener('click', () => modal.close());
    }
  }

  async function logout() {
    try { await api('logout'); } catch { /* Local sign-out still clears this device. */ }
    localStorage.removeItem('biologyAccount'); session = null; dash = null; header();
    if (modal.open) modal.close();
    renderGameGate();
  }

  function renderGameGate() {
    const match = location.hash.match(/^#lesson-(\d+)/);
    const content = document.querySelector('.lesson-content');
    if (!match || !content) return;
    content.querySelector('.biology-games-card')?.remove();
    const topic = Number(match[1]);
    const assigned = session?.user?.role === 'student' ? (dash?.homework || []).filter(h => h.active && h.topic_id === topic && h.class === session.user.class) : [];
    const card = document.createElement('section');
    card.className = 'biology-games-card';
    card.innerHTML = `<div class="game-lock-icon" aria-hidden="true">${assigned.length ? '✓' : '▣'}</div><div class="biology-games-content"><p class="eyebrow">Игры по теме</p><h2>${assigned.length ? 'Домашнее задание' : 'Игровые задания закрыты'}</h2>${assigned.length ? assigned.map((homework,i)=>`<article class="assigned-game"><div><strong>${esc(gamesLabel(homework.game))}</strong><small>Срок: ${esc(formatDate(homework.due_date))}</small></div>${['truth','crossword'].includes(homework.game)?`<button class="account-primary" type="button" data-start-biology-game="${i}">Начать</button>`:'<span>Игра появится позже</span>'}<div class="biology-game-play" data-game-root="${i}"></div></article>`).join('') : `<p>${session?.user?.role === 'student' ? 'Текст темы открыт. Учительские игры появятся здесь после назначения домашнего задания.' : 'Темы открыты всем. Игры доступны ученикам после назначения учителем.'}</p>`}<p class="form-hint">Сейчас доступны «Правда или ложь» и кроссворд. Колесо фортуны и «Своя игра» будут добавлены позже.</p></div>`;
    card.querySelectorAll('[data-start-biology-game]').forEach(button=>button.addEventListener('click',()=>{
      const homework=assigned[Number(button.dataset.startBiologyGame)];
      const root=card.querySelector(`[data-game-root="${button.dataset.startBiologyGame}"]`);
      button.hidden=true;
      const finish=async result=>{
        const status=root.querySelector('.game-save-status');
        if(status)status.textContent='Сохраняю результат…';
        try{await api('submit_result',{homework_id:result.homeworkId,topic_id:result.topicId,game:result.game,score:result.score,correct:result.correct,wrong:result.wrong});dash=await api('dashboard');if(status)status.textContent='Результат сохранён. Лучший результат по этому заданию попадёт в кабинет.';}
        catch(error){if(status)status.textContent=`Результат не удалось сохранить: ${error.message}`;}
      };
      if(homework.game==='truth')window.BIOLOGY_GAMES.statementGame(topic,root,homework,finish);
      else if(homework.game==='crossword')window.BIOLOGY_GAMES.crosswordGame(topic,root,homework,finish);
    }));
    content.append(card);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-auth]')) openAuth();
    else if (event.target.closest('[data-open-dashboard]')) openDashboard();
    else if (event.target.closest('[data-logout]')) logout();
  });
  window.addEventListener('hashchange', () => { setTimeout(renderGameGate, 0); });
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.open) modal.close(); });
  header();
  setTimeout(renderGameGate, 0);
})();
