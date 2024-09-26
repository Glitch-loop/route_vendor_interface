import React, { useState } from 'react';
import { View, FlatList, Pressable, Text, TouchableOpacity } from 'react-native';
import { Searchbar } from 'react-native-paper';
import tw from 'twrnc';
import { Provider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/*
  To make this module reusable, it was decided to pass as props an array of "any"
  and a string that is going to be used to search the variable.
*/

const SearchBarWithSuggestions = ({
    catalog,
    selectedCatalog,
    fieldToSearch,
    keyField,
    onSelectHandler,
  }:{
    catalog:any[],
    selectedCatalog: any[],
    fieldToSearch:string,
    keyField:string|number,
    onSelectHandler:any,
  }) => {
  // Importing redux state

  const [searchQuery, setSearchQuery] = useState<string>('');


  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Handler for search input changes
  const onChangeSearch = (query:string) => {
    setSearchQuery(query);

    // Filter data based on search query
    if (query) {
      
      const filtered = catalog.filter((item) => {
        let validQuery = item[fieldToSearch].toLowerCase().includes(query.toLowerCase());
        // let result = false;
        let result = true;
        // if (validQuery) {
        //   const selectedItem = selectedCatalog.find(verifySelectedItem => {
        //     return verifySelectedItem[fieldToSearch] === item[fieldToSearch];
        //   });

        //   if (selectedItem === undefined) {
        //     // Valid product to show.
        //     result = true;
        //   } else {
        //     // Product that was already choosen.
        //     result = false;
        //   }
        // } else {
        //   // Product that doesn't accomplish the query.
        //   result = false;
        // }

        return result;
      }
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  // Handler for when a suggestion is selected
  const onSelectItem = (item:any) => {
    onSelectHandler(item);
    setSearchQuery('');
    setFilteredData([]);
  };

  return (
    <View style={tw`w-11/12`}>
      <Provider>
        <Searchbar
          clearIcon={() => {return '';}}
          icon={() => <MaterialIcons name="search" size={24} color="gray" />}
          style={tw`border border-solid`}
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
        />
      </Provider>
      {/* Display suggestions */}
      {filteredData.length > 0 && (
        filteredData.map(item => (
          <Pressable
            key={item[keyField]}
            style={tw`p-3 border border-0 border-b-2 border-solid`}
            onPress={() => onSelectItem(item)}>
            <Text>
              {item[fieldToSearch]}
            </Text>
          </Pressable>
        ))
      )}
    </View>
  );
};

export default SearchBarWithSuggestions;
