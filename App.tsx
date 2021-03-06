/**
 * Sample React Native App
 *
 * adapted from App.js generated by the following command:
 *
 * react-native init example
 *
 * https://github.com/facebook/react-native
 */

import React, {Component} from 'react';
import {StyleSheet, Text, SafeAreaView} from 'react-native';
import ByronKlineChart, {
  dispatchByronKline,
  KLineIndicator,
  CandleHollow,
  KLineCallbackParams,
} from 'react-native-kline';
import axios from 'axios';

const BaseUrl = 'http://api.zhuwenbo.cc/v1';
const WsUrl = 'ws://49.233.210.12:1998/websocket';

export default class App extends Component {
  state = {
    datas: [],
    symbol: 'BTCUSDT',
    type: 'MIN_15',
  };

  ws: WebSocket | null = null;

  onMoreKLineData = async (params: KLineCallbackParams) => {
    console.log(' >> onMoreKLineData :', params);
    const {symbol, type} = this.state;
    const res = await axios.get(
      `${BaseUrl}/kline?type=${type}&symbol=${symbol}&to=${params.id}`,
    );
    if (!res || !res.data) {
      return;
    }
    dispatchByronKline('add', res.data);
  };

  async initKlineChart() {
    const {symbol, type} = this.state;
    const res = await axios.get(
      `${BaseUrl}/kline?type=${type}&symbol=${symbol}`,
    );
    if (!res || !res.data) {
      return;
    }
    this.setState({datas: res.data});
  }

  subscribeKLine = (event = 'subscribe') => {
    if (!this.ws) {
      return;
    }
    const {type, symbol} = this.state;
    const data = {
      event: event,
      data: `${type}/${symbol}`,
    };
    this.ws.send(JSON.stringify(data));
  };

  onWebSocketOpen = () => {
    this.subscribeKLine();
  };

  onWebSocketMessage = (evt: WebSocketMessageEvent) => {
    // console.log(' >> onWebSocketMessage:', evt.data);
    const {type, symbol} = this.state;
    const msg = JSON.parse(evt.data);
    const _type = `${type}/${symbol}`;
    if (!msg || msg.type !== _type || !msg.data) {
      return;
    }
    dispatchByronKline('update', [msg.data]);
  };

  componentDidMount() {
    this.initKlineChart();
    this.ws = new WebSocket(WsUrl);
    this.ws.onopen = this.onWebSocketOpen;
    this.ws.onmessage = this.onWebSocketMessage;
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcome}>☆ByronKline example☆</Text>
        <Text style={styles.instructions}>STATUS: loaded</Text>
        <Text style={styles.welcome}>☆☆☆</Text>
        <ByronKlineChart
          style={{height: 400}}
          datas={this.state.datas}
          onMoreKLineData={this.onMoreKLineData}
          indicators={[KLineIndicator.MainMA, KLineIndicator.VolumeShow]}
          // limitTextColor={'#FF2D55'}
          // mainBackgroundColor={'#ffffff'}
          // candleHollow={CandleHollow.ALL_HOLLOW}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
