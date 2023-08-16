# Finance50 / Harvard CS50W Final Project
#### Video Demo: https://youtu.be/cCIbmuci5yA
#### Description: Portfolio manager, asset tracker, and news aggregator web app with Django backend

#### Disclaimer: Finance50 runs with CORS enabled. If you are using Safari, you need to enable Develop tab on the menu bar and then check Develop > Disable Cross-Origin Restrictions. On Firefox and Chrome, [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) and [Moesif CORS Changer](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc) are good options, respectively. The app uses Yahoo Finance API on the frontend and it seems that Yahoo recently changed their policies towards cross origin resource sharing.

Finance50 is a web application where users can paper trade, manage their portfolios, view stock prices and company statistics, read the latest news about that company, and also aggregate news around the world according to their preferences. I opted for a finance/news application as I spend a notable amount of my time with brokerage applications where I view stocks, read the latest news and plan for my next investments.

## Distinctiveness and Complexity
Finance50 is distinct and more complex compared to the other projects in CS50W in the sense that it has many features and incorporates multiple APIs and multiple JavaScript libraries.

The application has a broader feature set compared to other projects in the course. A user can set their preferences and read news suited to their interests. They can view a stock, look at the price graph going back as old as 40Y, buy or sell that stock, view their portfolio, see how much of a profit/loss they have made on each stock they own, and view news specifically related to the company. It does have a dark/light mode switch too! Compared to other projects in CS50W, Finance50 offers more functionality to the end user, and as a result, it has a much larger codebase, especially on the frontend.

As mentioned above, Finance50 incorporates multiple JavaScript libraries, and multiple APIs, something that wasn't present throughout the course. For drawing charts I opted for using [ApexCharts](https://apexcharts.com/) JS library, for gathering chart data, I used [Yahoo Finance V8 API](https://query1.finance.yahoo.com/v8/finance/chart/AAPL?region=US&lang=en-US&interval=2m&range=1d) (which requires CORS to be allowed), for automatically arranging news items on the news page, I used [Masonry](https://masonry.desandro.com/), for waiting images to completely load before news section is organized with Masonry, I used [imagesLoaded](https://imagesloaded.desandro.com/) for JS.

On the backend, I used [Alpha Vantage API](https://www.alphavantage.co) in order to gather required data for displaying company info and buying/selling that company's stock. I used [requests 2.25.1](https://pypi.org/project/requests/) for gathering latest news from [NewsData.io](newsdata.io) API.

All in all, using multiple libraries and APIs has led me to interacting with many external sources and reading many documentations, something that has made working on this project quite complex and lengthy. I went way out of the course material to get a good understanding of utilizing different libraries and APIs together to create a functional and coherent web application.

## Directories
- `main`
    - `static` - Contains JS and CSS files.
        - `main.js` - Contains functions related to drawing charts, making GET requests to Yahoo API, making PUT requests to the backend to save color theme, retrieving user transaction history, and arranging news items using Masonry.
        - `styles.css` - Contains styling information of the app.
    - `templates` - Contains every HTML file needed.
    - `admin.py` - Used for enabling models to be accessed from Django's admin interface.
    - `models.py` - Contains models used within Finance50. `UserSetting` is for saving user news interests, `Asset` is for saving currently owned assets per user, `Transaction` is for saving every single asset transaction made to date, and `Theme` is for saving user dark/light theme preference.
    - `urls.py` - Contains url paths, and API routes for accessing backend with JavaScript.
    - `views.py` - Contains functions of the backend. Handles buying and selling, saves user preferences, makes requests to Alpha Vantage and NewsData.io
    - `db.sqlite3` - Database file containing all user data. 
    - `requirements.txt` - Contains Python libraries used in this project.

## How to run
1. Ensure Python 3 is installed on your system (Python 3.11 recommended).

2. From your terminal emulator, `cd` into Finance50 directory.

3. Type `python pip install -r  requirements.txt`, and press return. If it does not work, try `python3 pip install  -r  requirements.txt`.

4. Type `python manage.py runserver` (or type `python3 manage.py runserver` for that matter) and press return. You will see that a Django server has been started on a certain address.

5. Assuming you have already allowed CORS on your choice of browser by a suitable extension or by any means, visit the address that you have seen earlier on step 3.

6. Create a new account if you do not already have one.

## Notes
- When a user creates account, the first time they visit the news section they will always be greeted with the preferences screen where they will be prompted to choose their news interests.

- Up until I submitted the project, throughout the entire development period, I used [yfinance](https://pypi.org/project/yfinance/) on the backend for company data. Right I was about to submit the project, Yahoo decided to require cookies for each API call, so yfinance was just returning 401. I then quickly changed the backend to use Alpha Vantage API. One of the reasons I initially went with yfinance is that I did not have to supply an API key when submitting the project and I got to have an experience connecting a Python library with frontend. But on the other hand, Alpha Vantage is a much more reliable API and now I have one less Python dependency.

- After starting using Alpha Vantage on the backend, I wanted to use it on the frontend too, but scrapped the idea quickly since I would get rate limited in mere seconds because the quote view updates every five seconds. I also did not want to use a private API key on the frontend (even though I could hide it), and Yahoo Finance API (not to be confused with yfinance, yfinance queries Yahoo Finance V10, I query YF V8 on the frontend) seems to have somewhat more stable data flow and the data it supplies allows me to be much more flexible when rendering graphs with ApexCharts. 

- Please keep in mind that I am not supplying a premium Alpha Vantage key with Finance50. You will be rate limited after making 5 API calls per minute. You will probably get a `KeyError` when you are rate limited (`DEBUG` is set to `TRUE` in `settings.py`). This was not a problem with Yahoo Finance, though.

- In `main.js`, `renderGraph` function takes a boolean value `update`, so that I can manually control when to run the `setInterval` of 5000ms inside `renderGraph`. This is to prevent the interval from stacking and making tens of API requests per second.

- I was initially going to use [Chart.js](https://www.chartjs.org) for rendering charts but it did not work as I expected, so I opted for using [ApexCharts](https://apexcharts.com/).

- Parsing Yahoo Finance data on the frontend was quite challenging, since it supplies almost anything related to a ticker. The parsing is done within `renderGraph` function, starting at line 125.


- In the quote page, the stock price changes color to green or red depending on price movement. To see it, you may need to wait several seconds before the first price movement happens. It wasn't shown in the video since I recorded it on a Saturday, outside of market hours.

- You may notice that the app's name is "news". This is because it was going to be a news focused app, but then I changed directions with the app being finance oriented. I did change the name of the project but did not change the app's name, since there is no way for me to be sure that I've actually changed every reference to the old name of the app.