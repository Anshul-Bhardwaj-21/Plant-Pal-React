import { View, Text, StyleSheet } from 'react-native';

export default function AddPlantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add Plant</Text>
      <Text style={styles.subtext}>Identify plants using your camera</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
