// ^^ Remove after upgrade to Expo v50
// https://github.com/expo/expo/pull/24941
import 'expo-router/entry'
import { LogBox } from 'react-native'
import 'react-native-url-polyfill/auto'
console.disableYellowBox = true
LogBox.ignoreAllLogs()
