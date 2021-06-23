import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SimpleLineIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
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

const APP_STATE_KEY = "2BUY_STATE";
const SAVE = "SAVE";
const GET = "GET";

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
      fontsLoaded: false,
      showFooter: false,
      // footerPosition: new Animated.Value(107),
      dropdDownShow: false,
      showSettingsModal: false,
      currency: "Rs",
    };
    this.manageData(GET);
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
    this.toggleFooter = this.toggleFooter.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.footerPosition = new Animated.Value(Platform.OS === "ios" ? 127 : 107);
  }

  toggleDropdown() {
    const { dropdDownShow } = this.state;
    this.setState({ dropdDownShow: !dropdDownShow });
  }

  recordText(text, fieldName = "text") {
    if (!text) return;
    this.setState({ [fieldName]: text });
  }

  toggleFooter() {
    const { showFooter } = this.state;
    if (!showFooter) this.textInput.focus();
    //means user is trying to make the footer come up...
    else Keyboard.dismiss();
    this.setState({ showFooter: !showFooter });
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
    const changes = {
      items: newItems,
      text: "",
      price: 0,
      qty: 1,
      total: this.addAll(newItems),
      dropdDownShow: false,
    };
    this.setState(changes);
    this.priceInput.clear();
    this.textInput.clear();
    this.qtyInput.clear();
    this.manageData(SAVE, { ...this.state, ...changes });
  }

  onItemSelected(item) {
    const { items, bought } = this.state;
    const rest = (items || []).filter((itm) => itm.text !== item.text);
    const changes = {
      items: rest,
      bought: [item, ...bought],
      total: this.addAll(rest),
    };
    this.setState(changes);
    this.manageData(SAVE, { ...this.state, ...changes });
  }

  undoSelection(item) {
    const { items, bought } = this.state;
    const rest = (bought || []).filter((itm) => itm.text !== item.text);
    const newItems = [item, ...items];
    const changes = {
      bought: rest,
      items: newItems,
      total: this.addAll(newItems),
    };
    this.setState(changes);
    this.manageData(SAVE, { ...this.state, ...changes });
  }

  renderItems(purchased = false) {
    const { items, bought } = this.state;
    if (!purchased)
      return items.map((item, index) => {
        return (
          <View key={index.toString()}>
            <ListItem
              {...item}
              onItemSelected={this.onItemSelected}
              purchased={false}
              currency={this.state.currency}
            />
          </View>
        );
      });

    return bought.map((item, index) => {
      return (
        <View key={index.toString() + "----purch----"}>
          <ListItem
            {...item}
            onItemSelected={this.undoSelection}
            purchased
            currency={this.state.currency}
          />
        </View>
      );
    });
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

  async manageData(action = SAVE, state) {
    if (action === SAVE)
      try {
        if (state)
          await AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
        else await AsyncStorage.removeItem(APP_STATE_KEY);
        return;
      } catch (e) {
        console.log("STATE_SAVE_ERRORCOMEBACK: ", e.toString());
        return;
      }
    if (action === GET)
      try {
        const data = await AsyncStorage.getItem(APP_STATE_KEY);
        if (data) {
          var json = JSON.parse(data);
          this.setState({ ...json });
        }
      } catch (e) {
        console.log("STATE_RETRIEVAL_ERROR: ", e.toString());
        return;
      }
  }

  render() {
    const { bought, items, total, dropdDownShow, showSettingsModal, currency } =
      this.state;

    const behavior = Platform.OS === "ios" ? "padding" : "height";
    return (
      <SafeAreaView>
        <TouchableWithoutFeedback
          onPress={() => this.setState({ dropdDownShow: false })}
        >
          <KeyboardAvoidingView
            behavior={behavior}
            enabled
            style={{ flexGrow: 1, height: "100%" }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.coral.medium,
              }}
            >
              <Header
                total={total}
                toggleDropdown={this.toggleDropdown}
                currency={currency}
              />
              {dropdDownShow && (
                <OptionsDropdown
                  toggleDropdown={this.toggleDropdown}
                  show={this.state.dropdDownShow}
                  toggleModal={() =>
                    this.setState({
                      showSettingsModal: true,
                      dropdDownShow: false,
                    })
                  }
                  clearAll={() => {
                    this.setState({
                      items: [],
                      bought: [],
                      dropdDownShow: false,
                      total: 0,
                    });
                    this.manageData(SAVE, null);
                  }}
                />
              )}
              {/* ---------------------- MODAL ----------------------- */}
              <Modal visible={showSettingsModal} animationType="slide">
                <View
                  style={{
                    padding: 20,
                    paddingTop: 40,
                    flex: 1,
                    backgroundColor: Colors.coral.light,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      Settings
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({ showSettingsModal: false })
                      }
                      style={{ marginLeft: "auto" }}
                    >
                      <AntDesign
                        name="closecircle"
                        size={20}
                        color={Colors.coral.darker}
                        style={{ padding: 6 }}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ marginTop: 15 }}>
                    <Text style={{ color: Colors.coral.darker }}>
                      What currency should your calculations be made in...?
                    </Text>
                    <TextInput
                      autoFocus
                      placeholder={`Eg. 'Rs' `}
                      maxLength={4}
                      onChangeText={(text) => this.setState({ currency: text })}
                      style={{
                        borderLeftWidth: 3,
                        paddingLeft: 10,
                        marginTop: 8,
                        borderColor: Colors.coral.darker,
                        fontWeight: "bold",
                        color: Colors.coral.darker,
                      }}
                    />
                  </View>
                </View>
              </Modal>
              {/* ------------------------------------------------------ */}

              {this.renderEmptyBasket()}
              <ScrollView
                style={{
                  paddingLeft: 5,
                  paddingRight: 5,
                  flex: 1,
                  bottom: 55,
                  marginTop: 55,
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
              </ScrollView>
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
                position={this.footerPosition}
              />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }
}

const OptionsDropdown = (props) => {
  const { toggleModal, clearAll } = props;
  return (
    <View
      style={{
        minHeight: 100,
        width: 150,
        backgroundColor: "white",
        elevation: 3,
        position: "absolute",
        right: 3,
        top: Platform.OS === "ios" ? 55 : 80,
        borderBottomRightRadius: 7,
        borderBottomLeftRadius: 7,
        backgroundColor: Colors.coral.light,
        zIndex: 2,
      }}
    >
      <TouchableOpacity onPress={() => clearAll()}>
        <Text style={styles.dropItems}>Clear All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleModal()}>
        <Text style={styles.dropItems}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => BackHandler.exitApp()}>
        <Text style={styles.dropItems}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
};

const ListItem = (props) => {
  const { text, purchased, onItemSelected, price, qty, total, currency } =
    props;

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
          <Feather name="square" size={20} color="black" style={{ flex: 1 }} />
        ) : (
          <AntDesign
            name="checksquare"
            size={20}
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
              {currency} {total}
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
  const { total, toggleDropdown, currency } = props;
  return (
    <View style={styles.header}>
      <AntDesign name="shoppingcart" size={24} color="white" />
      <Text style={styles.title}>2BUY</Text>
      <View
        style={{
          marginLeft: "auto",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {currency || ""} {total}
        </Text>
        <TouchableOpacity
          onPress={() => toggleDropdown()}
          style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 10 }}
        >
          <SimpleLineIcons name="options-vertical" size={14} color="white" />
        </TouchableOpacity>
      </View>
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
    position,
  } = props;

  // const position = new Animated.Value(107);
  if (show)
    Animated.timing(position, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={
        !show
          ? {
              ...styles.footerContainer,
              bottom: Platform.OS === "ios" ? -127 : -107,
            }
          : {
              ...styles.footerContainer,

              transform: [{ translateY: position }],
            }
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
                color: "black",
                flex: 1,
                marginRight: 3,
                minHeight: 50,
              }}
              onChangeText={(val) => recordText(val, "price")}
              onSubmitEditing={(e) => submitText("many")}
              returnKeyType="done"
              keyboardType="numeric"
            />
            <TextInput
              ref={setQtyInput}
              placeholder="How many?"
              style={{
                borderBottomColor: Colors.coral.light,
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
    </Animated.View>
  );
};

var statusHeight = StatusBar.currentHeight;
// if (Platform.OS === "ios") statusHeight = 40;
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
    elevation: 2,
    marginTop: statusHeight,
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
  dropItems: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default App;
