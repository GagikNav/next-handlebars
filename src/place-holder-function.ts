import type { PlaceHolderProps } from '../types'

export const placeholder = ({ firstName, lastName, age }: PlaceHolderProps): string => {
  console.log('This is a placeholder function')
  console.log('logging parameters:', firstName, lastName, age)

  if (firstName === 'John') {
    console.log('Hello John')
  }
  if (lastName) {
    console.log('Hello', firstName, lastName)
  }
  if (age) {
    console.log('You are', age, 'years old')
  }

  console.log('This will be handlebars plugin for next js route')
  return 'This will be handlebars plugin for next js route'
}
