import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image, SafeAreaView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config';
import { COLORS, icons } from '../../constants';
import CustomButton from '../../components/CustomButton';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import BloodGroupFilterModal from '../../components/BloodGroupFilterModal';

const MassRequest = ({ navigation }) => {
  const [donors, setDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(''); // State for selected blood group
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [buttonColor, setButtonColor] = useState(COLORS.primaryRed); // State for button color

  function renderHeader() {
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 12,
            }}
        >
            <TouchableOpacity onPress={() => navigation.navigate("AdminDashboard")}>
                <MaterialCommunityIcons
                    name="view-dashboard"
                    size={28}
                    color={COLORS.primaryRed}
                />
            </TouchableOpacity>
            <View>
                <View
                    style={{
                        height: 6,
                        width: 6,
                        backgroundColor: COLORS.primaryRed,
                        borderRadius: 3,
                        position: 'absolute',
                        right: 5,
                        top: 5,
                    }}
                ></View>
                <TouchableOpacity onPress={() => console.log('Pressed')}>
                    <Ionicons
                        name="notifications-outline"
                        size={28}
                        color={COLORS.black}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

  useEffect(() => {
    fetchData();
  }, [selectedBloodGroup]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const donorData = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Apply the blood group filter
        if (!selectedBloodGroup || userData.bloodGroup === selectedBloodGroup) {
          donorData.push({ id: doc.id, ...userData });
        }
      });
      setDonors(donorData);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const filteredDonors = donors.filter((donor) => {
    // Case-insensitive search by fullName
    return donor.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const applyBloodGroupFilter = (bloodGroup) => {
    setSelectedBloodGroup(bloodGroup); // Update the selected blood group state
    setIsModalVisible(false); // Close the modal
  };

  const toggleSelection = (donor) => {
    const isSelected = selectedDonors.find((selected) => selected.id === donor.id);
    if (isSelected) {
      setSelectedDonors(selectedDonors.filter((selected) => selected.id !== donor.id));
    } else {
      setSelectedDonors([...selectedDonors, donor]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedDonors([]); // Deselect all users
    } else {
      setSelectedDonors([...filteredDonors]); // Select all users
    }
    setSelectAll(!selectAll); // Toggle the "Select All" state
  };

  const sendRequests = () => {
    // Implement the logic to send requests to selected donors
    // You can send requests to the users in the selectedDonors array
    console.log('Sending requests to:', selectedDonors);
    // Clear the selection after sending requests
    setSelectedDonors([]);
    setSelectAll(false); // Deselect all after sending requests
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderColor: 'lightgray',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: selectedDonors.find((selected) => selected.id === item.id)
          ? 'lightgreen'
          : 'white',
      }}
      onPress={() => toggleSelection(item)}
    >
      <Text>{item.fullName}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
    {renderHeader()}
      <Text style={styles.title}>Mass Request</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.searchQuery}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity
          style={styles.filterIconContainer}
          onPress={() => setIsModalVisible(true)}
        >
          <Image style={styles.filterIcon} source={icons.filterIcon} />
        </TouchableOpacity>
      </View>
      <View style={{ alignContent: 'center' }}>
        <TouchableOpacity
          style={[
            styles.selectAll,
            { backgroundColor: selectAll ? 'green' : COLORS.primaryRed },
            // Center the text within the button
            { justifyContent: 'center', alignItems: 'center' },
          ]}
          onPress={toggleSelectAll}
        >
          <Text style={styles.selectAllText}>
            {selectAll ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredDonors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <BloodGroupFilterModal
        isVisible={isModalVisible}
        onApplyFilter={applyBloodGroupFilter}
        onClose={() => setIsModalVisible(false)}
      />
      <View style={{ borderRadius: 30, marginHorizontal: 20 }}>
  <CustomButton
    title={`Send Requests to ${selectedDonors.length} ${selectedBloodGroup} Donors`}
    onPress={sendRequests}
    disabled={selectedDonors.length === 0}
    color={buttonColor}
  />
</View>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    color:COLORS.primaryRed
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  searchQuery: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'lightgray',
    margin: 16,
    padding: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconContainer: {
    marginLeft: 10,
  },
  selectAll: {
    paddingVertical:4,
    marginRight: 290,
    marginBottom: 8,
    width:85,
    backgroundColor: COLORS.primaryRed,
    borderRadius:5
  },
  selectAllText: {
    padding: 2,
    color: 'white',
  },
});

export default MassRequest;
