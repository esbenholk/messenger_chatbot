var spicedPg = require("spiced-pg");
var database = spicedPg(
  process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/britta_game_scores" ||
    "postgres://xnnemfwbcppafv:bfe1c10b6db98bb33ee03b0f3503172e6527022fe08a442c612ce475072c6439@ec2-52-5-110-35.compute-1.amazonaws.com:5432/d1e8jdbleeb74o"
);



/////get userdata from ID. 
module.exports.getUser= function getUser(id) {
  return database.query(`SELECT * FROM britta_game_scores WHERE id=$1`, [id]);
};

// /////CREATING USERNAME AND ID
module.exports.createUser = function createUser(id) {
  return database.query(
    `INSERT INTO britta_game_scores (id) VALUES ($1) RETURNING *`,
    [id]
  );
};


module.exports.dynamicMan = function dynamicMan(manID, message, id) {
  return database.query(
    `UPDATE britta_game_scores SET `+  manID + ` = $1 WHERE id =$2 RETURNING *`,
    [message,id]  
  );
};

module.exports.getDynamicMan = function getDynamicMan(manID, id) {
  return database.query( `SELECT `+  manID + ` FROM britta_game_scores WHERE id =$1`, [id]);
};


module.exports.getCurrentCharacter = function getCurrentCharacter(id) {
  return database.query( `SELECT current_character FROM britta_game_scores WHERE id =$1`, [id]);
};

module.exports.setCurrentCharacter = function setCurrentCharacter(character, id) {
  return database.query(
    `UPDATE britta_game_scores SET current_character = $1 WHERE id =$2`,
    [character,id]  
  );
};

module.exports.setCurrentSpace = function setCurrentSpace(space, id) {
  return database.query(
    `UPDATE britta_game_scores SET current_space = $1 WHERE id =$2`,
    [space,id]  
  );
};

module.exports.getCurrentSpace = function getCurrentSpace(id) {
  return database.query( `SELECT current_space FROM britta_game_scores WHERE id =$1`, [id]);
};


module.exports.dynamicSpace = function dynamicSpace(space, message, id) {
  return database.query(
    `UPDATE britta_game_scores SET `+  space + ` = $1 WHERE id =$2 RETURNING *`,
    [message,id]  
  );
};

module.exports.getDynamicSpace = function getDynamicSpace(space, id) {
  return database.query( `SELECT `+  space + ` FROM britta_game_scores WHERE id =$1`, [id]);
};

module.exports.getInteraction = function getInteraction(interaction, id) {
  return database.query( `SELECT `+  interaction + ` FROM britta_game_scores WHERE id =$1`, [id]);
};



// ////recaptcha query 
// module.exports.checkHumanity = function checkHumanity(humanityCheck, id) {
//   return database.query(
//     `UPDATE userdata SET humanity_check = $1 WHheokERE id =$2 RETURNING *`,
//     [humanityCheck, id]  
//   );
// };
// module.exports.updateEmail = function updateEmail(email, id) {
//   return database.query(
//     `UPDATE userdata SET email = $1 WHERE id =$2 RETURNING *`,
//     [email, id]  
//   );
// };


// module.exports.dynamicUpdate = function dynamicUpdate(column, value, id) {
//   return database.query(
//     `UPDATE userdata SET `+  column + ` =  ` + value + ` WHERE id =$1 RETURNING *`,
//     [id]  
//   );
// };

// module.exports.getTip = function getTip(performer, id) {
//   return database.query(
//     `SELECT` + performer + ` FROM userdata WHERE id =$1`,
//     [id]  
//   );
// };













module.exports.updatePaymentStatus= function updatePaymentStatus(has_tipped, real_name, performer, tip, id) {
  return database.query(
    `UPDATE userdata SET has_tipped_performer = $1, name=$2, `+  performer + ` =  ` + tip + ` WHERE id =$3 RETURNING *`,
    [has_tipped, real_name, id]  
  );
};











module.exports.registerTurnOn= function registerTurnOn(turnon, id) {
  return database.query(
    `UPDATE userdata SET fetish = $1 WHERE id =$2 RETURNING *`,
    [turnon, id]  
  );
};




