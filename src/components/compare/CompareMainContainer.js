import React, { useState ,useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // CSS for styling
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // JavaScript for transitions and behaviors
import { Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { wakeUpCompareAPI, fetchCompareDataAPI } from './apiService';

import CompareInput from './CompareInput';
import Message from './Message';
import CompareResult from './CompareResult';
// Import spinner component if using react-spinners
import { ClipLoader } from 'react-spinners'; 

import './CompareMainContainer.css';
import ActionBar from '../ActionBar';
import { API_CONSTANTS, APP_CONSTANTS } from '../../constants';
import { JSON_EXAMPLE_LEFT, JSON_EXAMPLE_RIGHT } from '../../constants/jsonExample';

const leftS = "actual";
const rightS = "expected";



function CompareMainContainer(){

  const [showBanner, setShowBanner] = useState(true);  // Controls the yellow banner visibility
  const [showErrorBanner, setShowErrorBanner] = useState(false);  // Controls the red banner visibility
  const [data, setData] = useState(null);  // Holds data from the second API


  const [leftInput, setLeftInput] = useState(null); // Use state for dynamic values
  const [rightInput, setRightInput] = useState(null); // Use state for dynamic values
  const [isFirstLoad, setIsFirstLoad] = useState(false); // Track initialization
  const [compareOut, setCompareOut]=useState(null);
  
  const [loading, setLoading] = useState(false); // State to track loading
  const resultRef = useRef(null); // Create a ref for the result element

  const validateJson = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return true; // JSON is valid
    } catch (e) {
      return false; // JSON is invalid
    }
  };

  const buildComparatorInput = () => {
     const payload = {
      actual: JSON.parse(leftInput),
      expected: JSON.parse(rightInput)
    };
    // Convert the object to a JSON string if needed
    const jsonString = JSON.stringify(payload);
    return jsonString;
  };

  //initialize the form
useEffect(() => {
    setLeftInput(JSON.stringify(JSON_EXAMPLE_LEFT, null, 2));
    setRightInput(JSON.stringify(JSON_EXAMPLE_RIGHT, null, 2));
    // Mark as initialized once inputs are set
    setIsFirstLoad(true);
},[]);// Run only once on component load

// call on isFirstLoad
useEffect(() => {
  if (isFirstLoad) {
    setIsFirstLoad(false);

    const initiateAPICalls = async () => {
      try {
        await wakeUpCompareAPI();  // Polling the first API until success or max attempts reached
        setShowBanner(false);  // Hide the yellow banner when successful
        compareData();
      } catch (error) {
        console.error('API error:', error);
        setShowBanner(false);
        setShowErrorBanner(true);  // Show the red banner if polling fails
      }finally{
        setLoading(false);
      }
    };

    initiateAPICalls();  // Start the API calls when component mounts
  }
}, [leftInput, rightInput]); // Trigger only when inputs are updated and initialized

const onClickCompare = async () => {
  if(leftInput && rightInput && validateJson(leftInput) && validateJson(rightInput)){
    compareData();
}
};

const compareData = async () => {
  try {
    // Create the JSON object
    const jsonString = buildComparatorInput();

    setLoading(true); // Set loading state to true before API call
    const cmpOut =  await fetchCompareDataAPI(jsonString);
    setCompareOut(JSON.stringify(cmpOut, null, 2));
  
    setLoading(false);
    window.requestAnimationFrame(() => {
      if (resultRef.current) {
        console.log(resultRef);
        resultRef.current.scrollIntoView({ behavior: 'smooth'  ,block: 'start', // Align the top of the element with the top of the viewport
          }); // Scroll to the element
      }
    });
   
  } catch (error) { 
    console.error('API error:', error);
    alert("error on calling compare API: ", error);
  } finally{
    setLoading(false); // Set loading state to false after API call
  }
};

const onClickSwap = async () => {
  // Create the JSON object
    const tmp = leftInput;
    setLeftInput(rightInput);
    setRightInput(leftInput);
};

const onClickClear = async () => {
  clear();
};

const clear = async () => {
  // Create the JSON object
    setLeftInput("{}");
    setRightInput("{}");
    setCompareOut(null);
};

  return (
    <div className="CompareMainContainer">
{/*Banner status */}
      {/* Yellow banner shown initially while waiting for backend to wake up */}
<div>
      {/* Bootstrap Alert component */}
      <Alert show={showBanner} variant="warning" onClose={() => setShowBanner(false)} dismissible>
          This service is freely available, so please be patient while the backend instance wakes up. This process typically takes less than one minute.
      </Alert>
    </div>
      
      {/* Red banner shown if 24 attempts fail */}
      <div>
      {/* Bootstrap Alert component */}
      <Alert show={showErrorBanner} variant="danger" onClose={() => setShowErrorBanner(false)} dismissible>
        Something went wrong. The backend instance could not wake up. Please try again later.
      </Alert>
    </div>
      
      {/* compare form */}
      <div>
        <div id="input-left" className="left input-left">
            <CompareInput value={leftInput|| ""} onChange={setLeftInput} ></CompareInput>
        </div>
        <div id="indicator" className='indicator'>
        &lt;&lt;{leftS}
        <br></br>
        {rightS}&gt;&gt;

        <div>
                {/* Conditionally render the spinner or the main content */}
      {loading ? (
        <div className="spinner-container">
          {/* Display spinner while loading */}
          <ClipLoader color="#00e0ac" loading={loading} size={50} />
        </div>
      ) :(
        
                <div/>
                
      )}
              </div>

        </div>
        <div id="input-right" className="right  input-right">
            <CompareInput value={rightInput|| ""} onChange={setRightInput} ></CompareInput>
        </div>
        </div>
        <div id="actionBar" className="actionBar">
          <ActionBar onClickSwap={onClickSwap} onClickCompare={onClickCompare} onClickClear={onClickClear}></ActionBar>
        </div>
        <div ref={resultRef} className="mainCompareResult">
             
                {/* Conditionally render the spinner or the main content */}
      {loading ? (
        <div>
        </div>
      ) :(
        <>
        <Message type="JSON"></Message>
        <div  >
               <CompareResult  compareResultValue={compareOut|| ""}></CompareResult>
                
                </div>
                </>
      )}
             
        </div>
    </div>
  );
}

export default CompareMainContainer;