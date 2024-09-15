import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { Searchbar } from 'react-native-paper';
import tw from 'twrnc';

/*
  To make this module reusable, it was decided to pass as props an array of "any"
  and a string that is going to be used to search the variable.
*/

const SearchBarWithSuggestions = ({
    catalog,
    fieldToSearch,
  }:{
    catalog:any[],
    fieldToSearch:string,
  }) => {
  // Importing redux state

  const [searchQuery, setSearchQuery] = useState<string>('');


  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Handler for search input changes
  const onChangeSearch = (query:string) => {
    setSearchQuery(query);

    // Filter data based on search query
    if (query) {
      console.log(catalog)
      const filtered = catalog.filter((item) =>
        item[fieldToSearch].toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  // Handler for when a suggestion is selected
  const onSelectItem = (item:any) => {
    setSearchQuery(item);
    setFilteredData([]);
  };

  return (
    <View style={tw`w-full`}>
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
      />
      {/* Display suggestions */}
      {filteredData.length > 0 && (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelectItem(item)}>
              <Text style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 200, backgroundColor: '#fff', marginTop: 10 }}
        />
      )}
    </View>
  );
};

export default SearchBarWithSuggestions;
