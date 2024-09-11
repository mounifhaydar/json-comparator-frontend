import { json } from 'react-router-dom';
import { API_CONSTANTS, APP_CONSTANTS } from '../../constants';


export const wakeUpCompareAPI = async () => {
    await fetchGreetingAPI();
};

export const fetchGreetingAPI = async (maxAttempts = 6, delay = 20000) => {
    let attempts = 0;
  
    const callAPI = async () => {
      try {
        const response = await fetch(API_CONSTANTS.COMPARATOR_ROUTE_COMPARE_DETAILS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({actual:{},expected:{}},null,2),
        }); // Replace with your actual API endpoint
        if (response.ok) {
          return response; // If the response is successful, return it
        } else {
            console.log("fail on retry wakup");
          throw new Error('API call failed');
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          //throw new Error('Max attempts reached');
        }
        console.log(`Retrying... (${attempts})`);
        await new Promise(res => setTimeout(res, delay)); // Wait before retrying
        return callAPI(); // Retry
      }
    };
  
    //await callAPI();
    return callAPI(); // Start the API call
  };

  export const fetchCompareDataAPI = async (jsonString) => {
    try {
      const responseO = await fetch(API_CONSTANTS.COMPARATOR_ROUTE_COMPARE_DETAILS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonString,
      }).then((response) => {
        if (response.ok) { 
            // The response status is in the range 200-299
            console.log("response.ok");
          return response.json();  // Convert the response body to JSON
        }else{
            // Handle the error response
            throw new Error('apiService-6000: ERROR Data API call failed');
        }
    }).catch((error) => {
        console.error('Error fetching data:', error);
        throw new Error('apiService-6010: Data API call failed');
      })
      .finally(() => {
        ; // Set loading state to false after API call
      });

      // console.log("responseO");
      // console.log(responseO);
      return responseO;
    } catch (error) {      
      console.error('Error fetching data:', error);
      throw new Error('apiService-6020: Data API call failed');
    }
  };
  