#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate the data for the SPY (SPDR S&P 500 ETF Trust) stock which
mirrors the overall S&P 500 index. This data is used to improve the performance
of the individual models by incorporating information about the stock market trends.

DEPENDENCY: runs from within the train_models.py code.

@author: dale
"""

import yfinance as yf
import pandas as pd

def features_stock_spy(con):
    
    TABLE_NAME = 'features_stock_spy'
    
    # Check if the table already exists
    cursor = con.cursor()
    statement = 'SELECT name FROM sqlite_master WHERE type="table" AND name="%s"' % TABLE_NAME
    cursor.execute(statement)    
    table_check = cursor.fetchall()
    cursor.close()
    
    # Populate the historical prices for SPY if starting new
    # Otherwise, append new daily prices upon the existing table
    if len(table_check) == 0:
        
        prices = yf.download('SPY', period='max', interval='1d')
        prices = prices.reset_index()
        prices = prices[['Date','Open','Close']]
        prices['stock_time'] = pd.to_datetime(prices['Date'])
        prices = prices[['stock_time','Open','Close']]
        prices.columns = ['stock_spy_time','stock_spy_open','stock_spy_close']
        
        statement = 'SELECT time FROM prices'
        crypto_times = pd.read_sql(statement, con)
        crypto_times['time'] = pd.to_datetime(crypto_times['time']).dt.strftime('%Y-%m-%d')
        crypto_times['time'] = pd.to_datetime(crypto_times['time'])
        crypto_times.drop_duplicates(inplace=True)
        prices = prices[prices['stock_spy_time'] >= min(crypto_times['time']) - pd.DateOffset(365)]
        crypto_times = crypto_times['time'].to_list()
        
        max_times = [max(prices[prices['stock_spy_time'] < t]['stock_spy_time']) for t in crypto_times]
        pairs = pd.DataFrame({'time':crypto_times, 'stock_spy_time':max_times})
        prices = prices.merge(pairs, on=['stock_spy_time'])
        
        prices.to_sql(TABLE_NAME, con, if_exists='replace', index=False)
    
    else:
        
        statement = 'SELECT MAX(stock_spy_time) AS MAX_TIME FROM %s' % TABLE_NAME
        max_date = pd.read_sql(statement, con)['MAX_TIME'].iloc[0]
        max_date = pd.to_datetime(max_date)      
        
        max_date_plus1 = max_date + pd.DateOffset(1)
        prices = yf.download('SPY', start=max_date_plus1, interval='1d')
        prices = prices.reset_index()
        prices = prices[prices['Date'] > max_date]
        
        if len(prices) > 0:
            prices.to_sql(TABLE_NAME, con, if_exists='append', index=False)
    
    # Gather all of the stock prices
    statement = 'SELECT * FROM %s' % TABLE_NAME
    all_prices = pd.read_sql(statement, con)
    all_prices['stock_spy_time'] = pd.to_datetime(all_prices['stock_spy_time'])
    all_prices['time'] = pd.to_datetime(all_prices['time'])
    con.close()
    print('[INFO] Finished gathering stock market data for SPY')
    return all_prices

