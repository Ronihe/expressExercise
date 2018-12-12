const express = require('express');
const fs = require('fs');

const results = 'results.txt';

const app = express();

app.use(express.json()); // spoiler: this is middleware!
app.use(express.urlencoded({ extended: true }));

app.get('/mean', function(req, res, next) {
  if (handleEmptyNum(req)) {
    res.status(400).send('nums are required');
  } else if (handleInvalidNum(req).length > 0) {
    res.status(400).send(`${handleInvalidNum(req)} are/is not a number(s)`);
  } else {
    let numsArr = req.query.nums.split(',');

    let sum = numsArr.reduce(function(accumulator, currentVal) {
      return parseInt(accumulator) + parseInt(currentVal);
    });

    let mean = sum / numsArr.length;

    let humanReadableResponse = `The mean of ${req.query.nums} is ${mean}.`;

    if (req.query.save === 'true') {
      writeToFile(humanReadableResponse + '\n');
    }

    res.send(humanReadableResponse);
  }
});

app.get('/median', function(req, res, next) {
  let numsArr = req.query.nums.split(',');

  let humanReadableResponse = `The median of ${req.query.nums} is ${median(
    numsArr
  )}.`;

  if (req.query.save === 'true') {
    writeToFile(humanReadableResponse + '\n');
  }

  res.send(humanReadableResponse);
});

app.get('/mode', function(req, res, next) {
  let numsArr = req.query.nums.split(',');

  let modeResults = mode(numsArr);

  let word = 'is';

  if (modeResults.length > 1) {
    word = 'are';
  }

  let humanReadableResponse = `The most frequent number of ${
    req.query.nums
  } ${word} ${modeResults}.`;

  if (req.query.save === 'true') {
    writeToFile(humanReadableResponse + '\n');
  }

  res.send(humanReadableResponse);
});

app.delete('/results', function(req, res, next) {
  fs.unlink(results, function(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log('File successfully deleted!');
    res.send('Results file successfully deleted!');
  });
});

app.get('/results', function(req, res, next) {
  if (!fs.existsSync(results)) {
    res.status(404).send('There are no results yet');
  } else {
    fs.readFile(results, 'utf-8', function(err, data) {
      res.send(data);
    });
  }
});

app.listen(3000, () => console.log('App on port 3000'));

function median(values) {
  values.sort(function(a, b) {
    return a - b;
  });

  if (values.length === 0) return 0;

  var half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];
  else return (values[half - 1] + values[half]) / 2.0;
}

function mode(numbers) {
  // as result can be bimodal or multi-modal,
  // the returned result is provided as an array
  // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
  var modes = [],
    count = [],
    i,
    number,
    maxIndex = 0;

  for (i = 0; i < numbers.length; i += 1) {
    number = numbers[i];
    count[number] = (count[number] || 0) + 1;
    if (count[number] > maxIndex) {
      maxIndex = count[number];
    }
  }

  for (i in count)
    if (count.hasOwnProperty(i)) {
      if (count[i] === maxIndex) {
        modes.push(Number(i));
      }
    }

  return modes;
}

function writeToFile(response) {
  fs.appendFileSync(results, response, function(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log('File successfully written!');
  });
}

function handleEmptyNum(req) {
  if (!('nums' in req.query)) {
    return true;
  }

  return false;
}

function handleInvalidNum(req) {
  let badNumberArr = [];

  let argumentArr = req.query.nums.split(',');

  for (let value of argumentArr) {
    if (isNaN(value)) {
      badNumberArr.push(value);
    }
  }
  return badNumberArr;
}
