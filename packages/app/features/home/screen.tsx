import React, { useState } from 'react'
import {
  Anchor,
  Button,
  H1,
  H3,
  Paragraph,
  ScrollView,
  Separator,
  Sheet,
  XStack,
  YStack,
  Text,
} from '@t4/ui/src'
import { ChevronDown } from '@tamagui/lucide-icons'
import { Linking } from 'react-native'
import { useLink } from 'solito/link'
import { useSheetOpen } from '../../atoms/sheet'
import { SolitoImage } from 'solito/image'
import { useUser } from 'app/utils/auth/useUser'
import { useSignOut } from 'app/utils/auth'
import { signOut } from '@t4/api/src/auth/user'

export function HomeScreen() {
  const { user } = useUser()

  const { signOut } = useSignOut()

  const signInLink = useLink({
    href: '/sign-in',
  })

  const signUpLink = useLink({
    href: '/sign-up',
  })

  const legendOfflineFirstLink = useLink({
    href: '/legend-offline-first',
  })

  return (
    <YStack {...legendOfflineFirstLink}>
      <Text>Hello World</Text>
    </YStack>
  )
}

