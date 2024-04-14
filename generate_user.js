const bcrypt = require('bcrypt');
const saltRounds = 10;
const password = "Saragdea.95";  

bcrypt.hash(password, saltRounds, function(err, hash) {
  // Aquí creas el objeto de usuario con el hash
  const user = {
    username: "sarutobi",  // Reemplaza esto con el nombre de usuario que quieres usar
    password: hash,
  };


  console.log(JSON.stringify(user, null, 2));
});
