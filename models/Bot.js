import { Client, Collection } from 'discord.js'
import { KSoftClient } from '@ksoft/api'
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'

class Bot extends Client {
  constructor (options) {
    super(options)
    this.commands = new Collection()
    this.aliases = new Collection()
    this.cooldowns = new Collection()
    this.ksoft = new KSoftClient(process.env.KSOFT_TOKEN)
    this.version = '1.2.4'
  }

  getMe (client) {
    return client
  }

  login (token) {
    super.login(token)
    return this
  }

  loadCommands () {
    const cmdFiles = fs.readdirSync(path.join(__dirname, '..', '/commands/')).filter(file => file.endsWith('.js'))
    for (const file of cmdFiles) {
      try {
        const command = new (require(path.join(__dirname, '..', `/commands/${file}`)))(this)
        this.commands.set(command.conf.name, command)
        command.conf.aliases.forEach(alias => {
          this.aliases.set(alias, command.conf.name)
        })
        console.log(chalk.green('>') + ` Registered command ${file} (name: ${command.conf.name} | aliases: ${command.conf.aliases})`)
      } catch (e) {
        console.log(chalk.gray('>') + ` Skipped command because it encountered an error: ${e}`)
      }
    }
  }

  loadEvents () {
    fs.readdir(path.join(__dirname, '..', '/events/'), (err, files) => {
      if (err) return console.error(err)
      files.forEach(file => {
        const event = require(path.join(__dirname, '..', `/events/${file}`))
        const eventName = file.split('.')[0]
        console.log(chalk.blue('>') + ` Added event: ${eventName}`)
        super.on(eventName, (...args) => event.run(this, ...args))
      })
    })
  }
}

module.exports = Bot
