import { StatusBar } from "expo-status-bar";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Button,
} from "react-native";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      text: "",
      bought: [],
      total: 0,
      price: 0,
    };
    this.recordText = this.recordText.bind(this);
    this.submitText = this.submitText.bind(this);
    this.undoSelection = this.undoSelection.bind(this);
    this.onItemSelected = this.onItemSelected.bind(this);
    this.priceInput = null;
    this.setPriceInput = (self) => (this.priceInput = self);
  }

  recordText(text, fieldName = "text") {
    if (!text) return;
    this.setState({ [fieldName]: text });
  }

  submitText(next = false) {
    if (next) {
      this.priceInput.focus();
      return;
    }
    const { text, items, price } = this.state;
    if (!text) return;
    this.setState({
      items: [{ text, price: price || "0" }, ...items],
      text: "",
      price: 0,
    });
  }

  onItemSelected(item) {
    const { items, bought } = this.state;
    const rest = (items || []).filter(
      (itm) => itm.text !== item.text && itm.price !== item.price
    );
    this.setState({
      items: rest,
      bought: [{ text: item.text, price: item.price }, ...bought],
    });
  }

  undoSelection(item) {
    const { items, bought } = this.state;
    const rest = (bought || []).filter(
      (itm) => itm.text !== item.text && itm.price !== item.price
    );
    this.setState({
      bought: rest,
      items: [{ text: item.text, price: item.price }, ...items],
    });
  }
  renderItems(purchased = false) {
    const { items, bought } = this.state;

    if (!purchased)
      return (
        <FlatList
          data={items}
          keyExtractor={(item) =>
            item.toString() + "-" + Math.random(10000).toString()
          }
          renderItem={(item) => {
            return (
              <ListItem
                text={`${item.item.text}`}
                price={item.item.price}
                onItemSelected={this.onItemSelected}
                purchased={false}
              />
            );
          }}
        />
      );

    return (
      <FlatList
        data={bought}
        keyExtractor={(item) =>
          item.toString() + "-purch-" + Math.random(10000).toString()
        }
        renderItem={(item) => {
          return (
            <ListItem
              text={`${item.item.text} `}
              price={item.item.price}
              onItemSelected={this.undoSelection}
              purchased
            />
          );
        }}
      />
    );
  }

  renderEmptyBasket() {
    const { bought, items } = this.state;
    if (bought.length === 0 && items.length === 0)
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            flexDirection: "column",
            // backgroundColor: "coral",
          }}
        >
          <AntDesign name="shoppingcart" size={40} color="rgb(168,84,53)" />
          <Text style={{ color: "rgb(168,84,53)" }}>
            Add items to your buy list...
          </Text>
        </View>
      );
  }
  render() {
    const { bought, items } = this.state;
    return (
      <View style={{ height: "100%", backgroundColor: "#ee8761" }}>
        <Header />
        {this.renderEmptyBasket()}
        <View style={{ paddingLeft: 5, paddingRight: 5 }}>
          {items && items.length > 0 && (
            <Text style={{ padding: 10, color: "black" }}>Items to buy...</Text>
          )}
          {this.renderItems()}
          {bought && bought.length > 0 && (
            <Text style={{ padding: 15, color: "black" }}>
              Already purchased items...
            </Text>
          )}
          {this.renderItems(true)}
        </View>
        <Footer
          recordText={this.recordText}
          submitText={this.submitText}
          text={this.state.text}
          price={this.state.price}
          setPriceInput={this.setPriceInput}
        />
      </View>
    );
  }
}

const ListItem = (props) => {
  const { text, purchased, onItemSelected, price } = props;
  const containerStyle = {
    flexDirection: "row",
    padding: 10,
    marginTop: 3,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 3,
    alignItems: "center",
  };
  return (
    <TouchableOpacity
      onPress={() => {
        if (onItemSelected) onItemSelected({ text, price });
      }}
    >
      <View
        style={
          purchased
            ? { ...styles.purchased, ...containerStyle }
            : { ...styles.notPurchased, ...containerStyle }
        }
      >
        {!purchased ? (
          <Feather name="square" size={24} color="black" style={{ flex: 1 }} />
        ) : (
          <AntDesign
            name="checksquare"
            size={24}
            color="black"
            style={{ flex: 1 }}
          />
        )}
        <Text
          style={{
            flex: 9,
          }}
        >
          {text}
          <Text
            style={{
              color: purchased ? "maroon" : "green",
              fontWeight: "bold",
            }}
          >
            {" "}
            {purchased ? " -" : " +"} {price}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};
const Header = () => {
  return (
    <View style={styles.header}>
      <AntDesign name="shoppingcart" size={24} color="white" />
      <Text style={styles.title}>2BUY</Text>
      <Text
        style={{
          marginLeft: "auto",
          color: "white",
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        45.3
      </Text>
    </View>
  );
};

const Footer = (props) => {
  const { submitText, recordText, text, setPriceInput, price } = props;
  return (
    <View style={styles.footerContainer}>
      <Text style={{ color: "white", fontWeight: "bold" }}>
        Whats the plan?
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 9, flexDirection: "column" }}>
          <TextInput
            placeholder="Eg. 'Buy Shoes'"
            autoFocus={true}
            style={{
              borderBottomColor: "#ffbca4",
              borderBottomWidth: 2,
              color: "black",
            }}
            onChangeText={(val) => recordText(val)}
            onSubmitEditing={(e) => submitText(true)}
            returnKeyType="done"
            value={text}
          />

          <TextInput
            ref={setPriceInput}
            placeholder="Price : Eg. 50.99"
            style={{
              borderBottomColor: "coral",
              borderBottomWidth: 2,
              color: "black",
            }}
            onChangeText={(val) => recordText(val, "price")}
            onSubmitEditing={(e) => submitText()}
            returnKeyType="done"
            keyboardType="numeric"
            value={price.toString()}
          />
        </View>
        <TouchableOpacity
          style={{ flex: 1, marginLeft: 6 }}
          onPress={() => submitText()}
        >
          <AntDesign name="pluscircle" size={35} color="#ffbca4" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  purchased: {
    backgroundColor: "#E0E0E0",
    color: "#282828",
    opacity: 0.4,
  },

  notPurchased: {
    backgroundColor: "#ffbca4",
    color: "black",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    minHeight: 55,
    // backgroundColor: "coral",
    backgroundColor: "#ff753a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 13,
    elevation: 6,
    marginTop: 37,
    display: "flex",
    flexDirection: "row",
    // justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    color: "white",
    fontSize: 15,
    marginLeft: 10,
  },
  footerContainer: {
    padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    minHeight: 50,
    backgroundColor: "coral",
  },
});

export default App;
