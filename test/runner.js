import {createRunner} from 'atom-mocha-test-runner';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import path from 'path';

import until from 'test-until';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({adapter: new Adapter()});

chai.use(chaiAsPromised);
global.assert = chai.assert;

global.stress = function(count, ...args) {
  const [description, ...rest] = args;
  for (let i = 0; i < count; i++) {
    it.only(`${description} #${i}`, ...rest);
  }
};

// Give tests that rely on filesystem event delivery lots of breathing room.
until.setDefaultTimeout(parseInt(process.env.UNTIL_TIMEOUT || '3000', 10));

module.exports = createRunner({
  htmlTitle: `GitHub Package Tests - pid ${process.pid}`,
  reporter: process.env.MOCHA_REPORTER || 'spec',
  overrideTestPaths: [/spec$/, /test/],
}, mocha => {
  mocha.timeout(parseInt(process.env.MOCHA_TIMEOUT || '5000', 10));

  if (process.env.TEST_JUNIT_XML_PATH) {
    mocha.reporter(require('mocha-junit-and-console-reporter'), {
      mochaFile: process.env.TEST_JUNIT_XML_PATH,
    });
  } else if (process.env.APPVEYOR_API_URL) {
    mocha.reporter(require('mocha-appveyor-reporter'));
  } else if (process.env.CIRCLECI === 'true') {
    mocha.reporter(require('mocha-junit-and-console-reporter'), {
      mochaFile: path.join(process.env.CIRCLE_TEST_REPORTS, 'mocha', 'test-results.xml'),
    });
  }
});
