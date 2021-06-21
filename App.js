import { StatusBar } from "expo-status-bar";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
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

const Colors = {
  coral: {
    normal: "#ff753a",
    light: "#ffbca4",
    darker: "rgb(168,84,53)",
    medium: "#ee8761",
    coral: "coral",

    // normal: "#383838",
    // light: "#707070",
    // darker: "#BEBEBE",
    // // medium: "#585858",
    // medium: "#696969",

    // normal: "#ff753a",
    // light: "#ffbca4",
    // darker: "rgb(168,84,53)",
    // medium: "white",
    // coral: "g",
  },
};

const dummy = [
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "A new text", price: 30, qty: 4 },
  { text: "Coco foods A new text", price: 30, qty: 4 },
];
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: dummy,
      text: "",
      bought: [],
      total: 0,
      price: 0,
      qty: 1,
      fontsLoaded: false,
      showFooter: false,
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
    // this._loadFontsAsync = this._loadFontsAsync.bind(this);
    this.toggleFooter = this.toggleFooter.bind(this);
  }

  recordText(text, fieldName = "text") {
    if (!text) return;
    this.setState({ [fieldName]: text });
  }

  toggleFooter() {
    this.setState({ showFooter: !this.state.showFooter });
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
    const newItems = [item, ...items];
    this.setState({
      bought: rest,
      items: newItems,
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
          <AntDesign
            name="shoppingcart"
            size={40}
            color={Colors.coral.darker}
          />
          <Text style={{ color: Colors.coral.darker }}>
            Add items to your buy list...
          </Text>
        </View>
      );
  }

  // async _loadFontsAsync() {
  //   await Font.loadAsync({
  //     "google-sans": require("./assets/fonts/ProductSans-Regular.ttf"),
  //     // "google-sans-bold": require("./assets/fonts/ProductSans-Bold.ttf"),
  //     // "google-sans-light": require("./assets/fonts/ProductSans-Light.ttf"),
  //     // "google-sans-regular": require("./assets/fonts/ProductSans-Bold.ttf"),
  //   });
  //   this.setState({ fontLoaded: true });
  // }
  // componentDidMount() {
  //   // this._loadFontsAsync();
  // }

  render() {
    const { bought, items, total, fontsLoaded } = this.state;
    // if (!fontsLoaded) return <AppLoading />;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.coral.medium,
          // paddingBottom: 117,
        }}
      >
        <Header total={total} />
        {this.renderEmptyBasket()}
        <View
          style={{
            paddingLeft: 5,
            paddingRight: 5,
            flex: 1,
            paddingBottom: 55,
          }}
        >
          {items && items.length > 0 && (
            <Text style={{ padding: 10, color: Colors.coral.darker }}>
              Items to buy...
            </Text>
          )}
          {this.renderItems()}
          {bought && bought.length > 0 && (
            <Text style={{ padding: 15, color: Colors.coral.darker }}>
              Removed items...
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
          show={this.state.showFooter}
          toggleFooter={this.toggleFooter}
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
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 3,
    alignItems: "center",
  };
  return (
    <TouchableOpacity
      onPress={() => {
        if (onItemSelected) onItemSelected({ text, price, qty, total });
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
                  color: Colors.coral.coral,
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
    setPriceInput,
    setQtyInput,
    setTextInput,
    show,
    toggleFooter,
  } = props;
  return (
    <View
      style={
        show
          ? styles.footerContainer
          : { ...styles.footerContainer, bottom: -107 }
      }
    >
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => toggleFooter()}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            padding: 20,
          }}
        >
          Whats the plan?
        </Text>

        {show ? (
          <AntDesign
            name="caretdown"
            size={20}
            color={Colors.coral.light}
            style={{ marginLeft: "auto", paddingRight: 25 }}
          />
        ) : (
          <AntDesign
            name="pluscircle"
            size={20}
            color={Colors.coral.light}
            style={{ marginLeft: "auto", paddingRight: 25 }}
          />
        )}
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 5,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        <View style={{ flex: 9, flexDirection: "column" }}>
          <TextInput
            ref={setTextInput}
            placeholder="Eg. 'Buy Shoes'"
            autoFocus={show}
            style={{
              borderBottomColor: Colors.coral.light,
              // borderBottomWidth: 1,
              color: "black",
              minHeight: 50,
            }}
            onChangeText={(val) => recordText(val)}
            onSubmitEditing={(e) => submitText("price")}
            returnKeyType="done"
            // value={text}
          />

          <View style={{ flexDirection: "row" }}>
            <TextInput
              ref={setPriceInput}
              placeholder="Price : Eg. 50.99"
              style={{
                borderBottomColor: Colors.coral.light,
                // borderBottomWidth: 1,
                color: "black",
                flex: 1,
                marginRight: 3,
                minHeight: 50,
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
                borderBottomColor: Colors.coral.light,
                // borderBottomWidth: 2,
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
          <AntDesign name="pluscircle" size={35} color={Colors.coral.light} />
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
    backgroundColor: Colors.coral.light,
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
    backgroundColor: Colors.coral.normal,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.9,
    shadowRadius: 13,
    elevation: 3,
    marginTop: 24,
    display: "flex",
    flexDirection: "row",
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
    // padding: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    elevation: 3,
    minHeight: 50,
    backgroundColor: Colors.coral.coral,
  },
});

export default App;
