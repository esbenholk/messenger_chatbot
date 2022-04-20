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


// module.exports.getEveryone = function getEveryone() {
//   return database.query(`SELECT * FROM userdata`);
// };

// module.exports.getUserDetails= function getUserDetails(username) {
//   return database.query(`SELECT * FROM userdata WHERE username=$1`, [username]);
// };

// /////CREATING USERNAME AND ID
module.exports.createUser = function createUser(id, username) {
  return database.query(
    `INSERT INTO britta_game_scores (id, username) VALUES ($1, $2) RETURNING *`,
    [id, username]
  );
};

// ////recaptcha query 
// module.exports.checkHumanity = function checkHumanity(humanityCheck, id) {
//   return database.query(
//     `UPDATE userdata SET humanity_check = $1 WHERE id =$2 RETURNING *`,
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
// module.exports.dynamicTip = function dynamicTip(performer, tip, id) {
//   return database.query(
//     `UPDATE userdata SET `+  performer + ` = $1 WHERE id =$2 RETURNING *`,
//     [tip,id]  
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




