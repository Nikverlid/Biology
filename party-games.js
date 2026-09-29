(() => {
  const G = window.BIOLOGY_GAMES;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value).toUpperCase().replace(/Ё/g,'Е').replace(/[^А-Я]/g,'');
  const shuffle = list => { const a=[...list]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; };
  const names = {own:'Своя игра',wheel:'Колесо фортуны'};
  function setup(game, topic, root, homework, finish, begin) {
    const classroom=!!homework.classroom;
    root.innerHTML=`<section class="party-setup"><p class="eyebrow">${classroom?'Игра на уроке':'Личное домашнее задание'}</p><h2>${names[game]}</h2><p>${game==='own'?'Выбирайте вопросы на табло. Верный ответ приносит стоимость вопроса, неверный — вычитает её. После каждого вопроса ход переходит дальше. Всего 15 вопросов.':'Угадайте 5 биологических терминов по подсказкам. Крутите барабан, называйте буквы или слово целиком. На каждое слово — 6 ошибок на всех участников.'}</p><p>${game==='own'?'В табло три категории: назови термин, выбери определение и узнай термин по первой букве.':'За каждую найденную букву начисляются очки сектора, за угаданное слово — ещё 500. Ошибка передаёт ход. «Пропуск» передаёт ход, «Банкрот» обнуляет очки текущего участника.'}</p><form class="party-form"><label>${classroom?'Имена участников или названия команд — каждое с новой строки (до 20)':'Имя участника'}<textarea name="players" rows="${classroom?5:1}" maxlength="1000" placeholder="${classroom?'Анна\nМихаил\nКоманда исследователей':'Твоё имя'}">${esc(classroom?'':homework.playerName||'Ученик')}</textarea></label><p>${classroom?'Можно играть одному для проверки. Общий счёт показывается в конце игры на этом экране.':'Проходи самостоятельно: результат этой попытки сохранится в твоём ДЗ.'}</p><p class="party-error" role="alert"></p><button class="account-primary" type="submit">Начать игру</button></form></section>`;
    root.querySelector('form').addEventListener('submit',e=>{
      e.preventDefault();
      const list=root.querySelector('textarea').value.split(/\n/).map(s=>s.trim()).filter(Boolean);
      const error=root.querySelector('.party-error');
      if(!list.length||list.length>(classroom?20:1)||list.some(s=>s.length>40)){error.textContent=classroom?'Введи от 1 до 20 имён, не длиннее 40 символов каждое.':'Введи одно имя, не длиннее 40 символов.';return;}
      begin(list.map(name=>({name,score:0}))); 
    });
  }
  function scoreboard(players, turn) {
    return `<div class="party-scores" aria-label="Счёт участников">${players.map((p,i)=>`<div class="party-score ${i===turn?'is-turn':''}"><span>${esc(p.name)}</span><strong>${p.score}</strong>${i===turn?'<small>Сейчас ходит</small>':''}</div>`).join('')}</div>`;
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
        root.innerHTML=`<p class="eyebrow">Своя игра · § ${topic}</p>${scoreboard(players,turn)}<p>Ход: <strong>${esc(players[turn].name)}</strong>. Выбери вопрос. Осталось: ${questions.filter(q=>!q.used).length}.</p><div class="own-board">${categories.map((c,col)=>`<section><h3>${c}</h3>${questions.filter(q=>q.category===col).map(q=>`<button type="button" data-question="${questions.indexOf(q)}" ${q.used?'disabled':''} aria-label="${c}, ${q.value} баллов${q.used?', сыграно':''}">${q.used?'✓':q.value}</button>`).join('')}</section>`).join('')}</div>`;
        root.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>ask(questions[Number(b.dataset.question)]));
      }
      function ask(q){
        let answered=false;
        root.innerHTML=`${scoreboard(players,turn)}<section class="own-question"><p class="eyebrow">${categories[q.category]} · ${q.value} баллов</p><h3>${q.category===1?`Что означает термин «${esc(q.item.answer)}»?`:esc(q.item.clue)}</h3>${q.category===2?`<p>Первая буква: <strong>${norm(q.item.answer)[0]}</strong>. Букв без пробелов: ${norm(q.item.answer).length}.</p>`:''}${q.category===1?`<div class="own-options">${q.options.map((o,i)=>`<button type="button" data-option="${i}">${esc(o.clue)}</button>`).join('')}</div>`:'<form class="party-form"><label>Ответ<input name="answer" autocomplete="off" required maxlength="100"></label><button class="account-primary" type="submit">Ответить</button></form>'}<button type="button" class="text-action" data-skip>Не знаю</button><div class="party-feedback" role="status"></div></section>`;
        function answer(ok){
          if(answered)return;answered=true;q.used=true;
          players[turn].score+=ok?q.value:-q.value;if(ok)correct++;
          root.querySelectorAll('button,input').forEach(el=>el.disabled=true);
          const result=root.querySelector('.party-feedback');
          result.innerHTML=`<h3>${ok?'Верно!':'Ответ не засчитан'} ${ok?'+':'−'}${q.value}</h3><p><strong>${esc(q.item.answer)}</strong> — ${esc(q.item.clue)}</p><button class="account-primary" type="button" data-next>К табло</button>`;
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
    setup('wheel',topic,root,homework,finish,players=>{
      const words=shuffle(G.banks[topic]).slice(0,5);
      let round=0,turn=0,correct=0,used=new Set(),misses=0,phase='spin',prize=0,rotation=0,message='Крути барабан, чтобы назвать букву.',roundDone=false;
      const current=()=>norm(words[round].answer);
      function nextTurn(){turn=(turn+1)%players.length;phase='spin';}
      function endRound(ok){roundDone=true;phase='done';if(ok){correct++;players[turn].score+=500;}message=`${ok?'Слово угадано! +500 баллов.':'Раунд завершён.'} Ответ: ${words[round].answer}.`;draw();}
      function draw(){
        if(round===5){complete('wheel',topic,root,homework,finish,players,correct,5,()=>wheelGame(topic,root,homework,finish));return;}
        root.innerHTML=`<p class="eyebrow">Колесо фортуны · слово ${round+1} из 5</p>${scoreboard(players,turn)}<div class="wheel-layout"><div class="wheel-shell"><span class="wheel-pointer" aria-hidden="true">▼</span><div class="fortune-wheel" style="transform:rotate(${rotation}deg)" aria-hidden="true">${sectors.map((s,i)=>`<span style="--angle:${i*45+22.5}deg">${s}</span>`).join('')}</div><div class="wheel-hub" aria-hidden="true">БИО</div></div><div class="wheel-task"><h3>${esc(words[round].clue)}</h3><div class="wheel-word" aria-label="Загаданное слово">${Array.from(words[round].answer.toUpperCase()).map(c=>/[А-ЯЁ]/.test(c)?`<span>${roundDone||used.has(norm(c))?esc(c):'·'}</span>`:'<i aria-hidden="true"> </i>').join('')}</div><p>Ошибок: ${misses} из 6 · Ход: <strong>${esc(players[turn].name)}</strong></p><p class="wheel-status" role="status">${esc(message)}</p>${roundDone?'<button class="account-primary" type="button" data-next-round>Дальше</button>':`<button class="account-primary" type="button" data-spin ${phase!=='spin'?'disabled':''}>Крутить барабан</button><div class="wheel-alphabet">${Array.from('АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ').map(c=>`<button type="button" data-letter="${c}" ${phase!=='letter'||used.has(c)?'disabled':''}>${c}</button>`).join('')}</div><p class="form-hint">Е и Ё считаются одной буквой.</p><form class="party-form wheel-answer"><label>Слово целиком<input name="answer" autocomplete="off" required maxlength="100" ${phase==='spinning'?'disabled':''}></label><button type="submit" ${phase==='spinning'?'disabled':''}>Назвать слово</button></form><button type="button" class="text-action" data-give-up ${phase==='spinning'?'disabled':''}>Не знаем — показать ответ</button>`}</div></div>`;
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
  Object.assign(G,{ownGame,wheelGame});
})();
