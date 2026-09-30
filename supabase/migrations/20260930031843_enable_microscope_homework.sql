alter table biology.homework drop constraint homework_game_check;
alter table biology.homework add constraint homework_game_check check (game in ('truth','crossword','own','wheel','microscope','walk','quiz'));
alter table biology.homework add constraint homework_microscope_topic_check check (game <> 'microscope' or topic_id in (9,10,14,21,22));
