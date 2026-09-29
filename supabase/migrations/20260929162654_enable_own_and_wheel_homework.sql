alter table biology.homework drop constraint homework_game_check;
alter table biology.homework add constraint homework_game_check check (game in ('truth','crossword','own','wheel','walk','quiz'));
