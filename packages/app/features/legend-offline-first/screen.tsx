import { observer } from '@legendapp/state/react'
import { observable } from '@legendapp/state'
import { Button, GetProps, H1, H2, Paragraph, YStack, styled } from '@t4/ui'
import { cars$ } from 'app/stores/carStore'
import React from 'react'
import { For } from '@legendapp/state/react'
import { createId } from '@paralleldrive/cuid2'
import { SolitoImage } from 'solito/image'
import { formatNumber, formatPrice } from '@t4/ui/src/libs/number'
import type { Car } from '@t4/api/src/db/schema'
import { useObservable, Reactive, Memo } from '@legendapp/state/react'
import Form from 'app/components/form/form'
import { InputPreset } from 'app/components/form/inputPresets'
import * as v from 'valibot'

// Create a new type with all properties optional
type PartialCar = Partial<Car>

const customStringSchema = v.pipe(
  v.string('Custom string must be a string.'),
  v.nonEmpty('Custom string must not be empty.')
)

const inputsConfig = [
  { name: 'make', preset: 'string', labelText: 'Make' },
  { name: 'model', preset: 'string', labelText: 'Model' },
  { name: 'year', preset: 'number', labelText: 'Year' },
  { name: 'color', preset: 'string', labelText: 'Color' },
  { name: 'price', preset: 'number', labelText: 'Price' },
  { name: 'mileage', preset: 'number', labelText: 'Mileage' },
  { name: 'fuelType', preset: 'string', labelText: 'Fuel Type' },
  { name: 'transmission', preset: 'string', labelText: 'Transmission' },
]

const formContainerStyle = {
  padding: 20,
  backgroundColor: '#f0f0f0',
}

const inputContainerStyle = {
  marginBottom: 20,
}

const inputStyle = {
  borderColor: 'green',
  padding: 15,
}

const inputTextStyle = {
  color: 'red',
}

const inputLabelStyle = {
  color: 'blue',
}

const inputErrorStyle = {
  color: 'orange',
}

export const LegendOfflineFirstScreen = observer((): React.ReactNode => {
  const carsList = cars$.get()
  console.log('carsList', carsList)

  const newCar$ = observable<PartialCar>({
    id: createId(),
    make: 'Honda',
    model: 'Pilot',
    year: 2015,
    color: 'Silver',
    price: 17000,
    mileage: 25000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
  })

  function createCar() {
    console.log('createCar')
    const newId = newCar$.get().id
    if (newId) cars$[newId].assign(newCar$.get())
  }

  function updateCar() {
    console.log('updateCar')

    const array = Object.values(carsList)
    const firstItem = array[0]
    const firstId = firstItem ? firstItem.id : undefined

    console.log('firstId', firstId)
    console.log('firstItem', firstItem)
    if (!firstId) return null

    // data needs to have an existing createdAt field to be updated, adding it here
    // since original data doesn't have it populated
    cars$[firstId].set({ ...firstItem, year: 2015, createdAt: '2024-01-01T00:00:00.000Z' })
  }

  const submitTrigger$ = observable(false)

  const handleFormSubmit = (formData) => {
    console.log('Form Submitted:', formData)
  }

  const handleCustomSubmit = () => {
    console.log('Custom submit button clicked')
    submitTrigger$.set(true)
  }

  // change form to have additional options, display submit button or not
  // submit function called when items change or when button is pressed
  // form labels or not
  // form validation while changing items or when submitting (if not autmatic)

  return (
    <YStack>
      <H1>Cars</H1>
      <For each={cars$}>
        {(car) => (
          <YStack
            flexDirection='row'
            paddingLeft='$2'
            onPress={() => {
              console.log('delete', car.get().id)
              const id = car.get().id
              cars$[id].delete()
            }}
          >
            <SolitoImage
              src='/t4-logo.png'
              width={56}
              height={56}
              alt='T4 Logo'
              style={{
                marginTop: 8,
              }}
            />
            <YStack>
              <Paragraph paddingTop='$2' paddingLeft='$3' paddingBottom='$1' fontSize={16}>
                {`${car.get().make} ${car.get().model}`}
              </Paragraph>
              <Paragraph paddingLeft='$3' fontSize={16} opacity={0.6}>
                {car.get().color} - {car.get().year} - {formatNumber(car.get().mileage)} miles -{' '}
                {formatPrice(car.get().price)}
              </Paragraph>
            </YStack>
          </YStack>
        )}
      </For>

      <H2 onPress={createCar}>Add Car</H2>

      <H2>Reusable Form</H2>
      <Form
        inputsConfig={inputsConfig}
        onSubmit={handleFormSubmit}
        formContainerStyle={formContainerStyle}
        inputContainerStyle={inputContainerStyle}
        inputStyle={inputStyle}
        inputTextStyle={inputTextStyle}
        inputLabelStyle={inputLabelStyle}
        inputErrorStyle={inputErrorStyle}
        submitTrigger$={submitTrigger$}
        showSubmit={false} // Hide the submit button within the form
        autoSubmit={true} // Auto-submit the form when all fields are valid
      />
      <Button onPress={handleCustomSubmit}>Custom Submit</Button>
      <H2 onPress={updateCar}>Update Car</H2>
    </YStack>
  )
})
