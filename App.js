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
      qty: 1,
    };
    this.recordText = this.recordText.bind(this);
    this.submitText = this.submitText.bind(this);
    this.undoSelection = this.undoSelection.bind(this);
    this.onItemSelected = this.onItemSelected.bind(this);
    this.priceInput = null;
    this.qtyInput = null;
    this.textInput = null;
    this.setPriceInput = (self) => (this.priceInput = self);
    this.setQtyInput = (self) => (this.qtyInput = self);
    this.setTextInput = (self) => (this.textInput = self);
  }

  recordText(text, fieldName = "text") {
    if (!text) return;
    this.setState({ [fieldName]: text });
  }

  addAll(items) {
    var n = 0;
    (items || []).forEach(
      (item) => (n += Number(item.price) * Number(item.qty))
    );
    return Math.round(n * 100) / 100;
  }
  submitText(next = false) {
    if (next && next === "price") {
      this.priceInput.focus();
      return;
    } else if (next && next === "many") {
      this.qtyInput.focus();
      return;
    }
    const { text, items, price, qty } = this.state;
    if (!text) return;
    const total = Math.round(Number(price) * Number(qty) * 100) / 100;
    const newItems = [{ text, price: price || "0", qty, total }, ...items];
    this.setState({
      items: newItems,
      text: "",
      price: 0,
      total: this.addAll(newItems),
    });
    this.priceInput.clear();
    this.textInput.clear();
    this.qtyInput.clear();
  }

  onItemSelected(item) {
    const { items, bought } = this.state;
    const rest = (items || []).filter(
      (itm) => itm.text !== item.text && itm.price !== item.price
    );
    this.setState({
      items: rest,
      bought: [item, ...bought],
      total: this.addAll(rest),
    });
  }

  undoSelection(item) {
    const { items, bought } = this.state;
    const rest = (bought || []).filter(
      (itm) => itm.text !== item.text && itm.price !== item.price
    );
    this.setState({
      bought: rest,
      items: [item, ...items],
      total: this.addAll(newItems),
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
                {...item.item}
                // text={`${item.item.text}`}
                // price={item.item.price}
                // qty={item.item.qty}
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
              {...item.item}
              // text={`${item.item.text} `}
              // price={item.item.price}
              // qty={item.item.qty}
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
    const { bought, items, total } = this.state;
    return (
      <View style={{ height: "100%", backgroundColor: "#ee8761" }}>
        <Header total={total} />
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
          setQtyInput={this.setQtyInput}
          setTextInput={this.setTextInput}
        />
      </View>
    );
  }
}

const ListItem = (props) => {
  const { text, purchased, onItemSelected, price, qty, total } = props;
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
        if (onItemSelected) onItemSelected({ text, price, qty });
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

        {price > 0 ? (
          <>
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

              <Text
                style={{
                  color: "orange",
                  fontWeight: "bold",
                  flexDirection: "row",
                }}
              >
                <AntDesign
                  name="arrowright"
                  size={15}
                  color="black"
                  style={{ marginLeft: 4, marginRight: 4 }}
                />
                ({qty})
              </Text>
            </Text>
            <Text style={{ marginLeft: "auto", fontWeight: "bold" }}>
              {total}
            </Text>
          </>
        ) : (
          <Text
            style={{
              flex: 9,
            }}
          >
            {text}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
const Header = (props) => {
  const { total } = props;
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
        {total}
      </Text>
    </View>
  );
};

const Footer = (props) => {
  const {
    submitText,
    recordText,
    text,
    setPriceInput,
    setQtyInput,
    setTextInput,
  } = props;
  return (
    <View style={styles.footerContainer}>
      <Text style={{ color: "white", fontWeight: "bold" }}>
        Whats the plan?
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 9, flexDirection: "column" }}>
          <TextInput
            ref={setTextInput}
            placeholder="Eg. 'Buy Shoes'"
            autoFocus={true}
            style={{
              borderBottomColor: "#ffbca4",
              borderBottomWidth: 2,
              color: "black",
            }}
            onChangeText={(val) => recordText(val)}
            onSubmitEditing={(e) => submitText("price")}
            returnKeyType="done"
            value={text}
          />

          <View style={{ flexDirection: "row" }}>
            <TextInput
              ref={setPriceInput}
              placeholder="Price : Eg. 50.99"
              style={{
                borderBottomColor: "#ffbca4",
                borderBottomWidth: 2,
                color: "black",
                flex: 1,
                marginRight: 3,
              }}
              onChangeText={(val) => recordText(val, "price")}
              onSubmitEditing={(e) => submitText("many")}
              returnKeyType="done"
              keyboardType="numeric"
              // value={price.toString()}
            />
            <TextInput
              ref={setQtyInput}
              placeholder="How many ?"
              style={{
                borderBottomColor: "#ffbca4",
                borderBottomWidth: 2,
                color: "black",
                flex: 1,
                marginLeft: 3,
              }}
              onChangeText={(val) => recordText(val, "qty")}
              onSubmitEditing={(e) => submitText()}
              returnKeyType="done"
              keyboardType="numeric"
            />
          </View>
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
