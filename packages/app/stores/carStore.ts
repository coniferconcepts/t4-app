// stores/carStore.js
import { observable } from '@legendapp/state'
import { syncedCrud } from '@legendapp/state/sync-plugins/crud'
import type { Car } from '@t4/api/src/db/schema'
import { client } from 'app/utils/trpc'

export const cars$ = observable<Car[]>(
  syncedCrud<Car, Car[]>({
    // generateId: () => createId(),
    mode: 'merge',
    // as: 'array',
    changesSince: 'last-sync',
    fieldCreatedAt: 'createdAt',
    fieldUpdatedAt: 'updatedAt',
    persist: {
      name: 'cars',
      retrySync: true,
    },
    debounceSet: 500,
    retry: {
      infinite: true,
      backoff: 'exponential',
    },

    list: async () => {
      const data = await client.car.list.query()
      return data || []
    },
    create: async (car: Car, params: any) => {
      console.log('create', car)
      try {
        const data = await client.car.create.mutate(car)
        return data
      } catch (error) {
        console.log('error', error)
        throw error
      }
    },
    update: async (car: Partial<Car>, params: any) => {
      console.log('update', car)
      try {
        const data = await client.car.update.mutate(car)
        return data
      } catch (error) {
        console.log('error', error)
        throw error
      }
    },
    delete: async (car: Partial<Car>, params: any) => {
      console.log('delete', car?.id)
      const { id } = car
      try {
        const data = await client.car.delete.mutate({ id })
        return data
      } catch (error) {
        console.log('error', error)
        throw error
      }
    },
  })
)
