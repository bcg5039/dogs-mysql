require('dotenv').config()

const express = require('express')
const app = express()
const dal = require('./dal-sql.js')
const port = process.env.PORT || 4000
const HTTPError = require('node-http-error')
const bodyParser = require('body-parser')
const { pathOr, keys, difference, path } = require('ramda')
//(breed,name,price,color,sex)
const checkRequiredFields = require('./lib/check-required-fields')
const checkDogReqFields = checkRequiredFields([
  'breed',
  'name',
  'color',
  'price',
  'sex'
])

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('Welcome to the Dogs API.')
})

//   CREATE  - POST /Dogs
app.post('/dogs', function(req, res, next) {
  const arrFieldsFailedValidation = checkDogReqFields(req.body)
  if (arrFieldsFailedValidation.length > 0) {
    return next(
      new HTTPError(400, 'Missing Required Fields', {
        fields: arrFieldsFailedValidation
      })
    )
  }

  dal.addDog(req.body, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(201).send(data)
  })
})

// READ - GET /Dogs/:id
app.get('/dogs/:id', function(req, res, next) {
  dal.getDog(req.params.id, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    if (data) {
      res.status(200).send(data)
    } else {
      next(new HTTPError(404, 'Not Found', { path: req.path }))
    }
  })
})

//   UPDATE -  PUT /dogs/:id

app.put('/dogs/:id', function(req, res, next) {
  const dogId = req.params.id
  const requestBody = pathOr('no body', ['body'], req)

  if (requestBody === 'no body') {
    return next(new HTTPError(400, 'Missing dog json in request body.'))
  }

  const arrFieldsFailedValidation = checkDogReqFields(requestBody)

  if (arrFieldsFailedValidation.length > 0) {
    return next(
      new HTTPError(400, 'Missing Required Fields', {
        fields: arrFieldsFailedValidation
      })
    )
  }

  if (dogId != requestBody.ID) {
    return next(
      new HTTPError(
        400,
        'The dog id in the path must match the dog id in the request body'
      )
    )
  }

  dal.updateDog(requestBody, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})

// DELETE -  DELETE /dogs/:id
app.delete('/dogs/:id', function(req, res, next) {
  const dogId = req.params.id
  console.log('dogId id: ', dogId)
  dal.deleteDog(dogId, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))

    res.status(200).send(data)
  })
})

//   LIST - GET /dogs
app.get('/dogs', function(req, res, next) {
  var limit = pathOr(5, ['query', 'limit'], req)
  limit = Number(limit)

  const filter = pathOr(null, ['query', 'filter'], req)
  const lastItem = pathOr(null, ['query', 'lastItem'], req)

  dal.listDogs(lastItem, filter, limit, function(err, data) {
    if (err) return next(new HTTPError(err.status, err.message, err))
    res.status(200).send(data)
  })
})

app.use(function(err, req, res, next) {
  console.log(req.method, ' ', req.path, ' ', 'error: ', err)
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('API Running on port:', port))
