import React, { View }  from 'react-native';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import tw from 'twrnc';

const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props:any) => (
    <BaseToast
      {...props}
      style={{height: 'auto', borderLeftColor: '#4CAF50' }}
      text1Style={{ fontSize: 14 }} // Adjust style
      text1NumberOfLines={2}
      text2Style={{ fontSize: 12, lineHeight: 20 }} // Adjust style
      text2NumberOfLines={2}
    />
  ),
  info: (props:any) => (
    <BaseToast
      {...props}
      style={{height: 'auto', borderLeftColor: '#2196F3' }}
      text1Style={{ fontSize: 14 }} // Adjust style
      text1NumberOfLines={2}
      text2Style={{ fontSize: 12, lineHeight: 20 }} // Adjust style
      text2NumberOfLines={2}
    />
  ),
  error: (props:any) => (
    <ErrorToast
      {...props}
      style={{height: 'auto', borderLeftColor: '#F44336' }}
      text1Style={{ fontSize: 14 }} // Adjust style
      text1NumberOfLines={2}
      text2Style={{ fontSize: 12, lineHeight: 20 }} // Adjust style
      text2NumberOfLines={2}
    />
  ),
};

const ToastMessage = () => {
  return (
    <View style={tw`absolute w-full z-20 flex flex-row justify-center`}>
      <Toast config={toastConfig}/>
    </View>
  );
};

export default ToastMessage;
