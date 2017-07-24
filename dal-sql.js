const mysql = require('mysql')
const HTTPError = require('node-http-error')
const { path, assoc, omit, compose, head, propOr, prop } = require('ramda')

/////////////////////////////START CREATE///////////////////////////////
const addDog = (dog, callback) => {
  createDog(dog, callback)
}

const createDog = (dog, callback) => {
  if (dog) {
    const connection = createConnection()
    connection.query('INSERT INTO dog SET ? ', dog, function(err, result) {
      if (err) return callback(err)
      if (propOr(null, 'insertId', result)) {
        callback(null, { ok: true, id: result.insertId })
      } else {
        callback(null, { ok: false, id: null })
      }
    })

    connection.end(function(err) {
      if (err) return err
    })
  } else {
    return callback(new HTTPError(400, 'Missing dog'))
  }
}
////////////////////////////////END CREATE/////////////////

/////////////////////////START READ///////////////////////////////////////
const getDog = (ID, callback) => {
  read('dog', ID, callback)
}

const read = (tableName, id, callback) => {
  if (id && tableName) {
    const connection = createConnection()

    connection.query(
      'SELECT * FROM ' + connection.escapeId(tableName) + ' WHERE ID = ? ',
      [id],
      function(err, result) {
        if (err) return callback(err)
        if (propOr(0, 'length', result) > 0) {
          head(result)
          console.log('Result: ', result)
          return callback(null, result)
        } else {
          //send back a 404

          return callback(
            new HTTPError(404, 'missing', {
              name: 'not_found',
              error: 'not found',
              reason: 'missing'
            })
          )
        }
      }
    )
  }
}

///////////////////////////END READ/////////////////////

//////UPDATE
const updateDog = (dog, callback) => update(dog, callback)
const update = (dog, callback) => {
  if (dog) {
    const connection = createConnection()

    connection.query('UPDATE dog SET ? WHERE ID = ?', [dog, dog.ID], function(
      err,
      result
    ) {
      if (err) return callback(err)
      console.log('Updated result: ', result)

      if (propOr(0, 'affectedRows', result) === 1) {
        return callback(null, { ok: true, id: dog.ID })
      } else if (propOr(0, 'affectedRows', result) === 0) {
        return callback(
          new HTTPError(404, 'missing', {
            name: 'not_found',
            error: 'not found',
            reason: 'missing'
          })
        )
      }
    })

    connection.end(function(err) {
      if (err) return err
    })
  } else {
    return callback(new HTTPError(400, 'Missing information'))
  }
}
//////////////////////START DELETE///////////////////////
const deleteDog = (ID, callback) => {
  deleteRow('dog', ID, callback)
}

const deleteRow = (tableName, id, callback) => {
  if (tableName && id) {
    const connection = createConnection()
    console.log('tableName: ', tableName)
    console.log('id: ', id)

    connection.query(
      'DELETE FROM ' + connection.escapeId(tableName) + ' WHERE ID = ?',
      [id],
      function(err, result) {
        if (err) return callback(err)
        if (result && result.affectedRows === 1) {
          return callback(null, { ok: true, id: id })
        } else if (result && result.affectedRows === 0) {
          return callback(
            new HTTPError(404, 'missing', {
              name: 'not_found',
              error: 'not found',
              reason: 'missing'
            })
          )
        }
      }
    )

    connection.end(err => err)
  } else {
    return callback(new HTTPError(400, 'Missing id or entity name.'))
  }
}
/////////////////////////////END DELETE///////////////////
/////////////////////START HELPERS/////////////////////

function createConnection() {
  return mysql.createConnection({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  })
}
///////////////////END HELPERS////////////////
const dal = { addDog, getDog, updateDog, deleteDog }

module.exports = dal
