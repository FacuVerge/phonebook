require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
morgan.token('body', req => {
	return JSON.stringify(req.body)
})

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
	Person.find({}).then(persons => {
		response.json(persons)
	}).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then(person => {
			response.json(person)
		})
		.catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {

	const body = request.body

	if (!body.name) {
		return response.status(400).json({
			error: 'Name is missing'
		})
	}

	if (!body.phone) {
		return response.status(400).json({
			error: 'Phone is missing'
		})
	}

	const person = new Person({
		name: body.name,
		phone: body.phone,
	})

	person.save().then(savedPerson => {
		response.json(savedPerson)
	}).catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
	const { name, phone } = request.body

	Person.findByIdAndUpdate(
		request.params.id,
		{ name, phone },
		{ new: true, runValidators: true, context: 'query' }
	)
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
	Person.deleteOne({ _id: request.params.id }).then(
		response.status(204).end()
	).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'Unknown endpoint. Try another one' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'Malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})