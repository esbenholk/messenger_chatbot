
DROP TABLE IF EXISTS britta_game_scores;
CREATE TABLE britta_game_scores(

    id NUMERIC,
    username VARCHAR,
    
    current_space VARCHAR,

    form1 VARCHAR,
    form2 VARCHAR,
    form3 VARCHAR,

    man1 VARCHAR,
    man2 VARCHAR,
    man3 VARCHAR,
    man4 VARCHAR,

    artist VARCHAR,
    artistquest_result VARCHAR,
    
    man1quest_result VARCHAR,
    man2quest_result VARCHAR,
    man3quest_result VARCHAR,
    man4quest_result VARCHAR,

    has_met_director VARCHAR, 
    director VARCHAR,

    chosen_form VARCHAR,
    chosen_man VARCHAR,
    has_succesfully_convinced_man VARCHAR,

    additional1 VARCHAR, 
    additional2 VARCHAR, 
    additional3 VARCHAR, 
    additional4 VARCHAR, 
    additional5 VARCHAR, 
    additional6 VARCHAR, 
    additional7 VARCHAR, 
    additional8 VARCHAR, 
    additional9 VARCHAR, 
    additional10 VARCHAR

);
