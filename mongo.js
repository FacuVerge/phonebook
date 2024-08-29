const mongoose = require('mongoose')

const password = process.argv[2];

const url =
  `mongodb+srv://facuverge:${password}@full-stack-course.i2ong.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Full-Stack-Course`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  phone: String,
})

const Person = mongoose.model('Person', personSchema)

switch(process.argv.length) {
    case 3:
        Person.find({}).then(result => {
            console.log('Phonebook:')
            result.forEach(person => {
                console.log(person.name, person.phone)
            })
            mongoose.connection.close()
        })

        break;
    case 5:
        const person = new Person({
            name: process.argv[3],
            phone: process.argv[4],
        })

        person.save().then(result => {

            console.log(`Added ${result.name} name ${result.phone} to phonebook!`)
            mongoose.connection.close()
        })

        break;
    default:
        console.log('Bad arguments')
        process.exit(1)
}

