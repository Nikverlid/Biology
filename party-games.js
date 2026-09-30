(() => {
  const G = window.BIOLOGY_GAMES;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value).toUpperCase().replace(/Ё/g,'Е').replace(/[^А-Я]/g,'');
  const shuffle = list => { const a=[...list]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; };
  const names = {own:'Своя игра',wheel:'Колесо фортуны'};
  function setup(game, topic, root, homework, finish, begin) {
    const classroom=!!homework.classroom,teams=classroom&&game==='own';
    let saved=[];try{saved=JSON.parse(localStorage.getItem('biologyTeams')||'[]');}catch{}
    if(!Array.isArray(saved))saved=[];
    root.innerHTML=`<section class="party-setup"><p class="eyebrow">${classroom?'Игра на уроке':'Личное домашнее задание'}</p><h2>${names[game]}</h2><p>${game==='own'?'Выбирайте вопросы на табло. Верный ответ приносит стоимость вопроса, неверный — вычитает её. После каждого вопроса ход переходит следующей команде. Всего 15 вопросов.':'Угадайте 5 биологических терминов. Крутите барабан, называйте буквы или слово целиком. На каждое слово — 6 ошибок.'}</p><form class="party-form">${teams?`<label>Количество команд<select name="team-count"><option value="2">2 команды</option><option value="3">3 команды</option><option value="4">4 команды</option></select></label><div class="team-fields"></div><p>Названия можно изменить. Команды по очереди выбирают вопрос и отвечают вместе.</p>`:`<label>Имя участника<input name="player" maxlength="40" value="${esc(homework.playerName||'Ученик')}"></label><p>Результат этой попытки сохранится в твоём ДЗ.</p>`}<p class="party-error" role="alert"></p><button class="account-primary" type="submit">Начать игру</button></form></section>`;
    const count=root.querySelector('[name="team-count"]');
    function teamFields(){
      const old=[...root.querySelectorAll('[name="team"]')].map(i=>i.value);
      if(old.length)saved=old;
      root.querySelector('.team-fields').innerHTML=Array.from({length:Number(count.value)},(_,i)=>`<label class="team-field team-color-${i}">Команда ${i+1}<input name="team" maxlength="40" required value="${esc(saved[i]||['Исследователи','Открыватели','Знатоки природы','Биологи'][i])}"></label>`).join('');
    }
    if(teams){count.value=String(Math.min(4,Math.max(2,saved.length)));teamFields();count.onchange=teamFields;}
    root.querySelector('form').addEventListener('submit',e=>{
      e.preventDefault();
      const list=[...root.querySelectorAll(teams?'[name="team"]':'[name="player"]')].map(i=>i.value.trim());
      if(list.some(n=>!n||n.length>40)||new Set(list.map(n=>n.toLowerCase())).size!==list.length){root.querySelector('.party-error').textContent='Введи разные названия длиной от 1 до 40 символов.';return;}
      if(teams)try{localStorage.setItem('biologyTeams',JSON.stringify(list));}catch{}
      begin(list.map((name,i)=>({name,score:0,color:i})));
    });
  }
  function scoreboard(players, turn) {
    return `<div class="party-scores" aria-label="Счёт игры">${players.map((p,i)=>`<div class="party-score team-color-${p.color??i} ${i===turn?'is-turn':''}"><span>${esc(p.name)}</span><strong>${p.score}</strong>${i===turn?'<small>Сейчас ходит</small>':''}</div>`).join('')}</div>`;
  }
  function complete(game,topic,root,homework,finish,players,correct,total,restart) {
    const ranked=[...players].sort((a,b)=>b.score-a.score),best=ranked[0].score;
    root.innerHTML=`<section class="game-finish"><p class="eyebrow">${names[game]} · итоги</p><h2>${players.length===1?'Игра завершена':`Победители: ${ranked.filter(p=>p.score===best).map(p=>esc(p.name)).join(', ')}`}</h2>${scoreboard(ranked,-1)}<p>Верных ответов: <strong>${correct} из ${total}</strong>. ${homework.classroom?'Это общий результат игры на уроке.':`Результат ДЗ: ${Math.round(correct/total*100)}%. Игровые очки показаны отдельно.`}</p><p class="game-save-status" role="status">${homework.classroom?'Счёт игры на уроке не записывается в личные результаты учеников.':''}</p><button type="button" class="account-primary" data-restart>Сыграть ещё раз</button></section>`;
    root.querySelector('[data-restart]').onclick=restart;
    if(!homework.classroom)finish?.({homeworkId:homework.id,game,topicId:topic,score:Math.round(correct/total*100),correct,wrong:total-correct});
  }
  function ownGame(topic,root,homework,finish) {
    setup('own',topic,root,homework,finish,players=>{
      const bank=shuffle(G.banks[topic]);
      const questions=bank.map((item,i)=>({item,category:Math.floor(i/5),value:(i%5+1)*100,used:false,options:shuffle([item,...shuffle(bank.filter(b=>b!==item)).slice(0,3)])}));
      let turn=0,correct=0;
      const categories=['Назови термин','Выбери определение','Первая буква'];
      function board(){
        if(questions.every(q=>q.used)){complete('own',topic,root,homework,finish,players,correct,15,()=>ownGame(topic,root,homework,finish));return;}
        root.innerHTML=`<p class="eyebrow">Своя игра · § ${topic}</p>${scoreboard(players,turn)}<p>Ход: <strong>${esc(players[turn].name)}</strong>. Выбери вопрос. Осталось: ${questions.filter(q=>!q.used).length}.</p><div class="own-board">${categories.map((c,col)=>`<section><h3>${c}</h3>${questions.filter(q=>q.category===col).map(q=>`<button type="button" class="${q.used?(q.correct?'board-correct':'board-wrong'):''}" data-question="${questions.indexOf(q)}" ${q.used?'disabled':''} aria-label="${c}, ${q.value} баллов${q.used?', сыграно':''}">${q.used?(q.correct?'✓':'×'):q.value}</button>`).join('')}</section>`).join('')}</div>`;
        root.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>ask(questions[Number(b.dataset.question)]));
      }
      function ask(q){
        let answered=false;
        root.innerHTML=`${scoreboard(players,turn)}<section class="own-question"><p class="eyebrow">${categories[q.category]} · ${q.value} баллов</p><h3>${q.category===1?`Что означает термин «${esc(q.item.answer)}»?`:esc(q.item.clue)}</h3>${q.category===2?`<p>Первая буква: <strong>${norm(q.item.answer)[0]}</strong>. Букв без пробелов: ${norm(q.item.answer).length}.</p>`:''}${q.category===1?`<div class="own-options">${q.options.map((o,i)=>`<button type="button" data-option="${i}">${esc(o.clue)}</button>`).join('')}</div>`:'<form class="party-form"><label>Ответ<input name="answer" autocomplete="off" required maxlength="100"></label><button class="account-primary" type="submit">Ответить</button></form>'}<button type="button" class="text-action" data-skip>Не знаю</button><div class="party-feedback" role="status"></div></section>`;
        function answer(ok){
          if(answered)return;answered=true;q.used=true;q.correct=ok;
          players[turn].score+=ok?q.value:-q.value;if(ok)correct++;
          root.querySelectorAll('button,input').forEach(el=>el.disabled=true);
          const result=root.querySelector('.party-feedback');result.classList.add(ok?'feedback-correct':'feedback-wrong');
          result.innerHTML=`<h3>${ok?'✓ Верно!':'× Ответ не засчитан'} ${ok?'+':'−'}${q.value}</h3><p><strong>${esc(q.item.answer)}</strong> — ${esc(q.item.clue)}</p><button class="account-primary" type="button" data-next>К табло</button>`;
          result.querySelector('[data-next]').onclick=()=>{turn=(turn+1)%players.length;board();};
        }
        root.querySelector('form')?.addEventListener('submit',e=>{e.preventDefault();answer(norm(root.querySelector('input').value)===norm(q.item.answer));});
        root.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>answer(q.options[Number(b.dataset.option)]===q.item));
        root.querySelector('[data-skip]').onclick=()=>answer(false);
        root.querySelector('input')?.focus();
      }
      board();
    });
  }
  const sectors=[100,200,300,400,'Пропуск',500,600,'Банкрот'];
  function wheelGame(topic,root,homework,finish){
    if(homework.classroom)return classroomWheel(topic,root,homework);
    setup('wheel',topic,root,homework,finish,players=>{
      const words=shuffle(G.banks[topic]).slice(0,5);
      let round=0,turn=0,correct=0,used=new Set(),misses=0,phase='spin',prize=0,rotation=0,message='Крути барабан, чтобы назвать букву.',roundDone=false;
      const current=()=>norm(words[round].answer);
      function nextTurn(){turn=(turn+1)%players.length;phase='spin';}
      function endRound(ok){roundDone=true;phase='done';if(ok){correct++;players[turn].score+=500;}message=`${ok?'Слово угадано! +500 баллов.':'Раунд завершён.'} Ответ: ${words[round].answer}.`;draw();}
      function draw(){
        if(round===5){complete('wheel',topic,root,homework,finish,players,correct,5,()=>wheelGame(topic,root,homework,finish));return;}
        root.innerHTML=`<p class="eyebrow">Колесо фортуны · слово ${round+1} из 5</p>${scoreboard(players,turn)}<div class="wheel-layout"><div class="wheel-shell"><span class="wheel-pointer" aria-hidden="true">▼</span><div class="fortune-wheel" style="transform:rotate(${rotation}deg)" aria-hidden="true">${sectors.map((s,i)=>`<span style="--angle:${i*45+22.5}deg">${s}</span>`).join('')}</div><div class="wheel-hub" aria-hidden="true">БИО</div></div><div class="wheel-task"><h3>${esc(words[round].clue)}</h3><div class="wheel-word" aria-label="Загаданное слово">${Array.from(words[round].answer.toUpperCase()).map(c=>/[А-ЯЁ]/.test(c)?`<span>${roundDone||used.has(norm(c))?esc(c):'·'}</span>`:'<i aria-hidden="true"> </i>').join('')}</div><p>Ошибок: ${misses} из 6 · Ход: <strong>${esc(players[turn].name)}</strong></p><p class="wheel-status ${message.includes('нет.')||message.includes('другое слово')||message.includes('Банкрот')?'feedback-wrong':roundDone||message.startsWith('Есть')?'feedback-correct':''}" role="status">${esc(message)}</p>${roundDone?'<button class="account-primary" type="button" data-next-round>Дальше</button>':`<button class="account-primary" type="button" data-spin ${phase!=='spin'?'disabled':''}>Крутить барабан</button><div class="wheel-alphabet">${Array.from('АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ').map(c=>`<button type="button" data-letter="${c}" ${phase!=='letter'||used.has(c)?'disabled':''}>${c}</button>`).join('')}</div><p class="form-hint">Е и Ё считаются одной буквой.</p><form class="party-form wheel-answer"><label>Слово целиком<input name="answer" autocomplete="off" required maxlength="100" ${phase==='spinning'?'disabled':''}></label><button type="submit" ${phase==='spinning'?'disabled':''}>Назвать слово</button></form><button type="button" class="text-action" data-give-up ${phase==='spinning'?'disabled':''}>Не знаем — показать ответ</button>`}</div></div>`;
        root.querySelector('[data-next-round]')?.addEventListener('click',()=>{round++;used=new Set();misses=0;roundDone=false;nextTurn();message='Крути барабан, чтобы назвать букву.';draw();});
        root.querySelector('[data-spin]')?.addEventListener('click',spin);
        root.querySelectorAll('[data-letter]').forEach(b=>b.onclick=()=>{
          if(phase!=='letter'||used.has(b.dataset.letter))return;
          const letter=b.dataset.letter;used.add(letter);
          const count=Array.from(current()).filter(c=>c===letter).length;
          if(count){players[turn].score+=count*prize;message=`Есть буква ${letter}! +${count*prize} баллов. Крути ещё раз.`;phase='spin';}
          else{misses++;message=`Буквы ${letter} нет. Ход переходит дальше.`;nextTurn();}
          if(Array.from(current()).every(c=>used.has(c)))endRound(true);else if(misses>=6)endRound(false);else draw();
        });
        root.querySelector('form')?.addEventListener('submit',e=>{
          e.preventDefault();if(phase==='spinning'||roundDone)return;
          if(norm(root.querySelector('input').value)===current())endRound(true);
          else{misses++;message='Это другое слово. Ход переходит дальше.';nextTurn();if(misses>=6)endRound(false);else draw();}
        });
        root.querySelector('[data-give-up]')?.addEventListener('click',()=>{if(phase!=='spinning')endRound(false);});
      }
      function spin(){
        if(phase!=='spin')return;
        phase='spinning';message='Барабан вращается…';draw();
        const selected=Math.floor(Math.random()*sectors.length);
        const target=(360-(selected*45+22.5))%360;
        rotation+=360*4+((target-rotation%360+360)%360);
        const wheel=root.querySelector('.fortune-wheel');
        // Two frames preserve the starting angle before the slow transition.
        requestAnimationFrame(()=>requestAnimationFrame(()=>{if(wheel.isConnected)wheel.style.transform=`rotate(${rotation}deg)`;}));
        let settled=false;
        function settle(){
          if(settled)return;settled=true;if(!wheel.isConnected)return;
          const s=sectors[selected];
          if(typeof s==='number'){prize=s;phase='letter';message=`Выпало ${s}. Выбери букву.`;}
          else{if(s==='Банкрот')players[turn].score=0;nextTurn();message=`${s}! Ход переходит к ${players[turn].name}.`;}
          draw();
        }
        wheel.addEventListener('transitionend',settle,{once:true});
        setTimeout(settle,8000);
      }
      draw();
    });
  }
  async function classroomWheel(topic,root,homework){
    let rosters={},cls='5А';try{cls=localStorage.getItem('biologyWheelClass')||cls;}catch{}
    if(!['5А','5Б'].includes(cls))cls='5А';
    root.innerHTML=`<section class="party-setup"><p class="eyebrow">Игра на уроке</p><h2>Колесо фортуны</h2><p>Колесо выбирает участника. Он отвечает на вопрос с четырьмя вариантами. Ответившие уходят с колеса, а их результаты остаются в списке справа.</p><form class="party-form roster-form"><label>Класс<select name="roster-class"><option>5А</option><option>5Б</option></select></label><p class="roster-summary" role="status">Загружаю список участников…</p><details class="roster-editor"><summary>Изменить список участников</summary><label>Имена — каждое с новой строки, до 20 участников<textarea rows="7" maxlength="1000" name="roster"></textarea></label><button type="button" class="account-button" data-save-roster>Сохранить список</button></details><p class="form-hint">Список класса общий для учителя и администратора и сохраняется между темами, играми и устройствами.</p><p class="party-error" role="status"></p><button class="account-primary" type="submit" disabled>Начать игру</button></form></section>`;
    const form=root.querySelector('form'),select=root.querySelector('select'),input=root.querySelector('textarea'),status=root.querySelector('.roster-summary'),error=root.querySelector('.party-error'),start=root.querySelector('[type="submit"]');
    select.value=cls;
    const read=()=>input.value.split(/\n/).map(n=>n.trim()).filter(Boolean);
    function showRoster(){input.value=(rosters[cls]||[]).join('\n');status.textContent=`${cls}: ${(rosters[cls]||[]).length} участников в сохранённом списке.`;root.querySelector('details').open=!(rosters[cls]?.length);}
    async function save(){
      const list=read();
      if(!list.length||list.length>20||list.some(n=>n.length>40)||new Set(list.map(n=>n.toLowerCase())).size!==list.length)throw Error('Введи от 1 до 20 разных имён, не длиннее 40 символов каждое.');
      if(JSON.stringify(list)!==JSON.stringify(rosters[cls]||[])){
        const data=await homework.rosterApi('save_game_roster',{class:cls,names:list});
        rosters[cls]=data.names;
      }
      try{localStorage.setItem('biologyWheelClass',cls);}catch{}
      status.textContent=`Список ${cls} сохранён: ${list.length} участников.`;return list;
    }
    select.onchange=()=>{cls=select.value;error.textContent='';showRoster();};
    root.querySelector('[data-save-roster]').onclick=async e=>{e.currentTarget.disabled=true;select.disabled=true;error.textContent='';try{await save();}catch(err){error.textContent=err.message;}finally{if(root.isConnected){root.querySelector('[data-save-roster]').disabled=false;select.disabled=false;}}};
    form.onsubmit=async e=>{e.preventDefault();start.disabled=true;select.disabled=true;error.textContent='';try{const list=await save();if(root.isConnected)play(list);}catch(err){error.textContent=err.message;start.disabled=false;select.disabled=false;}};
    try{const data=await homework.rosterApi('game_rosters');if(!form.isConnected)return;rosters=data.rosters||{};showRoster();}
    catch(err){if(!form.isConnected)return;error.textContent=`Не удалось загрузить список: ${err.message}`;root.querySelector('details').open=true;status.textContent='Список пока не загружен.';}
    start.disabled=false;
    function play(list){
      const people=list.map((name,i)=>({id:i,name,status:null}));
      const bank=shuffle(G.banks[topic]);let turn=0,selected=null,rotation=0,phase='ready',options=[],answer=null;
      const palette=['#2563eb','#db2777','#7c3aed','#ea580c','#0891b2','#059669'];
      function draw(){
        const pending=people.filter(p=>p.status===null),done=people.length-pending.length;
        if(!pending.length){
          root.innerHTML=`<section class="game-finish"><p class="eyebrow">Колесо фортуны · ${cls}</p><h2>Все участники ответили!</h2><p>Верных ответов: <strong>${people.filter(p=>p.status).length} из ${people.length}</strong></p>${roster()}<button class="account-primary" type="button" data-again>Новая игра</button></section>`;
          root.querySelector('[data-again]').onclick=()=>classroomWheel(topic,root,homework);return;
        }
        const colors=pending.map((p,i)=>`${palette[i%palette.length]} ${i/pending.length*360}deg ${(i+1)/pending.length*360}deg`).join(',');
        root.innerHTML=`<p class="eyebrow">Колесо фортуны · ${cls} · ответили ${done} из ${people.length}</p><div class="class-wheel-layout ${phase==='question'||phase==='answered'?'has-question':''}"><section class="class-wheel-stage"><div class="wheel-shell"><span class="wheel-pointer" aria-hidden="true">▼</span><div class="fortune-wheel name-wheel" style="background:conic-gradient(${colors});transform:rotate(${rotation}deg)" aria-hidden="true">${pending.map((p,i)=>`<span style="--angle:${(i+.5)/pending.length*360}deg"><b>${esc(p.name)}</b></span>`).join('')}</div><div class="wheel-hub" aria-hidden="true">БИО</div></div><button class="account-primary wheel-spin" data-class-spin type="button" ${phase!=='ready'?'disabled':''}>${phase==='spinning'?'Колесо вращается…':'Крутить колесо'}</button><div class="class-wheel-question" aria-live="polite">${selected?`<h3>Отвечает: ${esc(selected.name)}</h3>`:'<p>Нажми кнопку, чтобы выбрать участника.</p>'}${phase==='question'?`<p>${turn<15?esc(answer.clue):`Что означает термин «${esc(answer.answer)}»?`}</p><div class="own-options">${options.map((item,i)=>`<button type="button" data-class-answer="${i}">${esc(turn<15?item.answer:item.clue)}</button>`).join('')}</div>`:phase==='answered'?`<div class="${selected.status?'feedback-correct':'feedback-wrong'}"><strong>${selected.status?'✓ Верно!':'× Ошибка'}</strong><p>${esc(answer.answer)} — ${esc(answer.clue)}</p></div><button class="account-primary" type="button" data-class-next>Следующий участник</button>`:''}</div></section><aside class="class-wheel-roster"><h3>Участники и ответы</h3>${roster()}</aside></div>`;
        root.querySelector('[data-class-spin]').onclick=spin;
        root.querySelectorAll('[data-class-answer]').forEach(b=>b.onclick=()=>{if(phase!=='question')return;selected.status=options[Number(b.dataset.classAnswer)]===answer;phase='answered';draw();});
        root.querySelector('[data-class-next]')?.addEventListener('click',()=>{turn++;selected=null;phase='ready';rotation=0;draw();});
      }
      function roster(){return `<ol class="wheel-roster">${[...people].sort((a,b)=>a.name.localeCompare(b.name,'ru')).map(p=>`<li class="${p.status===null?'roster-waiting':p.status?'roster-correct':'roster-wrong'}"><span>${esc(p.name)}</span><b>${p.status===null?'Ожидает':p.status?'✓ Верно':'× Неверно'}</b></li>`).join('')}</ol>`;}
      function spin(){
        if(phase!=='ready')return;phase='spinning';draw();
        const pending=people.filter(p=>p.status===null),i=Math.floor(Math.random()*pending.length);
        selected=pending[i];answer=bank[turn%bank.length];options=shuffle([answer,...shuffle(bank.filter(x=>x!==answer)).slice(0,3)]);
        const target=(360-(i+.5)/pending.length*360)%360;rotation+=1440+(target-rotation%360+360)%360;
        const wheel=root.querySelector('.fortune-wheel');let settled=false;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{if(wheel.isConnected)wheel.style.transform=`rotate(${rotation}deg)`;}));
        function settle(){if(settled)return;settled=true;if(!wheel.isConnected)return;phase='question';draw();}
        wheel.addEventListener('transitionend',settle,{once:true});setTimeout(settle,8000);
      }
      draw();
    }
  }

  Object.assign(G,{ownGame,wheelGame});
})();
