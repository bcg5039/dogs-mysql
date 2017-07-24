require('dotenv').config()

const mysql = require('mysql')

const sql = `INSERT INTO dog
(breed,name,price,color,sex)
VALUES
('Greyhound','Speedy',300.00,'White','M'),
('Doberman','Hunter',500.00,'Black','M'),
('German Shepherd','Scout',800.00,'Black/Brown','M'),
('Yorkie','Sophie',600.00,'Brindle','F'),
('Greyhound','Molassas',100.00,'Beige','F'),
('Husky','Frosty',850.00,'White','M'),
('Husky','Snowshoe',850.00,'White','F'),
('Poodle','Prissy',550.00,'White','F'),
('Poodle','Phillip',570.00,'Black','M'),
('Whippet','Kermit',700.00,'Brindle','M'),
('Briard','Mop',650.00,'Beige','M'),
('Briard','Shaggy',600.00,'Black','F')`

function createConnection() {
  return mysql.createConnection({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })
}

function createDogs() {
  const connection = createConnection()
  connection.query(sql, function(err, result) {
    if (err) return console.log('createDogs() error', err)
    console.log('createDogs() SUCCESS!', JSON.stringify(result, null, 2))
  })
  connection.end(function(err) {
    if (err) return err
    console.log('bye!')
  })
}

createDogs()
