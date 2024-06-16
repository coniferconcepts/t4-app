import { observer } from '@legendapp/state/react';
import { observable } from '@legendapp/state';
import { Button, H1, H2, Paragraph, YStack } from '@t4/ui';
import { cars$ } from 'app/stores/carStore';
import React from 'react';
import { For } from '@legendapp/state/react';
import { createId } from '@paralleldrive/cuid2';
import { SolitoImage } from 'solito/image';
import { formatNumber, formatPrice } from '@t4/ui/src/libs/number';
import type { Car } from '@t4/api/src/db/schema';
import Form, { InputConfig } from 'app/components/form/form';

type PartialCar = Partial<Car>;

const inputsConfig: InputConfig[] = [
  { name: 'make', preset: 'string', labelText: 'Make', placeholder: 'Make' },
  { name: 'model', preset: 'string', labelText: 'Model', placeholder: 'Model' },
  { name: 'year', preset: 'number', labelText: 'Year', placeholder: 'Year' },
  { name: 'color', preset: 'string', labelText: 'Color', placeholder: 'Color' },
  { name: 'price', preset: 'number', labelText: 'Price', placeholder: 'Price' },
  { name: 'mileage', preset: 'number', labelText: 'Mileage', placeholder: 'Mileage' },
  { name: 'fuelType', preset: 'string', labelText: 'Fuel Type', placeholder: 'Fuel Type' },
  { name: 'transmission', preset: 'string', labelText: 'Transmission', placeholder: 'Transmission' },
  { name: 'accepted', preset: 'switch', labelText: 'Accepted' },
  { name: 'carType', preset: 'select', labelText: 'Car Type', placeholder: 'Select Car Type', options: [{ id: 1, value: 'SUV' }, { id: 2, value: 'Sedan' }] },
  { name: 'driveType', preset: 'radioGroup', labelText: 'Drive Type', options: [{ id: 1, value: 'AWD' }, { id: 2, value: 'FWD' }, { id: 3, value: 'RWD' }] },
  { name: 'features', preset: 'toggleGroup', labelText: 'Features', options: [{ id: 1, value: 'Sunroof' }, { id: 2, value: 'Leather Seats' }, { id: 3, value: 'Bluetooth' }] },
  { name: 'description', preset: 'textArea', labelText: 'Description', placeholder: 'Enter description', style: { minHeight: 400 } },
  { name: 'rating', preset: 'slider', labelText: 'Rating', style: { max: 100, step: 1 } },
];

const formContainerStyle = { padding: 20, backgroundColor: '#f0f0f0' };
const inputContainerStyle = { marginBottom: 20 };
const inputStyle = { borderColor: 'green', padding: 15 };
const inputTextStyle = { color: 'red' };
const inputLabelStyle = { color: 'blue' };
const inputErrorStyle = { color: 'orange' };

export const LegendOfflineFirstScreen = observer((): React.ReactNode => {
  const carsList = cars$.get();
  console.log('carsList', carsList);

  function createCar(car: PartialCar) {
    console.log('createCar', car);
    car.id = createId();
    console.log('car with id', car);
  }

  function updateCar() {
    console.log('updateCar');
    const array = Object.values(carsList);
    const firstItem = array[0];
    const firstId = firstItem ? firstItem.id : undefined;
    console.log('firstId', firstId);
    console.log('firstItem', firstItem);
    if (!firstId) return null;
    cars$[firstId].set({ ...firstItem, year: firstItem.year + 1, createdAt: '2024-01-01T00:00:00.000Z' });
  }

  function clearAllCar() {
    console.log('clearAllCar');
    cars$.set({});
  }

  const submitTrigger$ = observable(false);

  const handleFormSubmit = (formData) => {
    console.log('Form Submitted:', formData);
    createCar(formData);
  };

  const handleCustomSubmit = () => {
    console.log('Custom submit button clicked');
    submitTrigger$.set(true);
  };

  return (
    <YStack>
      <H1>Cars</H1>
      <For each={cars$}>
        {(car) => (
          <YStack
            flexDirection="row"
            paddingLeft="$2"
            onPress={() => {
              console.log('delete', car.get().id);
              const id = car.get().id;
              cars$[id].delete();
            }}
          >
            <SolitoImage
              src="/t4-logo.png"
              width={56}
              height={56}
              alt="T4 Logo"
              style={{ marginTop: 8 }}
            />
            <YStack>
              <Paragraph paddingTop="$2" paddingLeft="$3" paddingBottom="$1" fontSize={16}>
                {`${car.get().make} ${car.get().model}`}
              </Paragraph>
              <Paragraph paddingLeft="$3" fontSize={16} opacity={0.6}>
                {car.get().color} - {car.get().year} - {formatNumber(car.get().mileage)} miles - {formatPrice(car.get().price)}
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
        showSubmit={false}
        autoSubmit={false}
      />
      <Button onPress={handleCustomSubmit}>Custom Submit</Button>
      <H2 onPress={updateCar}>Update Car</H2>
      <H2 onPress={clearAllCar}>Clear All Cars</H2>
    </YStack>
  );
});
