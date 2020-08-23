import React from 'react';
import { StyleSheet, Text, View,Image } from 'react-native';
import Searchscreen from './screens/searchscreen';
import Transactionscreen from './screens/transactionscreen';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
export default class App extends React.Component {
  render(){
    return(
<AppContainer/>
    )
  }
}
const Tabnavigator=createBottomTabNavigator({
  transaction:{screen:Transactionscreen},
  search:{screen:Searchscreen},
},
{
  defaultNavigationOptions:({navigation})=>({
tabBarIcon:({})=>{
  const routeName=navigation.state.routeName
if(routeName==='transaction'){
return(
<Image source={require('./assets/book.png')}style={{width:50,height:30}}/>
  )

}
else if(routeName==='search'){
  return(
    <Image source={require('./assets/searchingbook.png')}style={{width:50,height:30}}/>
      )
}
}

  })
}
)
const AppContainer=createAppContainer(
Tabnavigator
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
