/**
 * Drawer Navigator
 * Wraps the Tab Navigator to provide drawer menu functionality
 */
import React from "react"
import { createDrawerNavigator } from "@react-navigation/drawer"
import { CustomDrawerContent } from "@/components/CustomDrawerContent"
import { TabNavigator } from "./TabNavigator"
import type { DrawerParamList } from "./navigationTypes"

const Drawer = createDrawerNavigator<DrawerParamList>()

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: {
          width: 280,
        },
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
    </Drawer.Navigator>
  )
}
