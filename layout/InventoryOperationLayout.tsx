import { Text, View } from "react-native";
import TableInventoryOperations from "../components/TableInventoryOperations";
import tw from 'twrnc';

const InventoryOperationLayout = () => {
  return (
    <View style={tw`w-full h-full`}>
      <TableInventoryOperations />
    </View>
  )
};

export default InventoryOperationLayout;
