# Deployment Pipeline Quickstart

This repository exists as a supplement to the [Deployment Pipeline Basics: How-To Guide](https://socotra-generated-documentation.s3-eu-west-1.amazonaws.com/sphinx/deployment-guide/special/deployment-how-tos.html) (**DRAFT**). Here you'll find all the code needed to create tests, create basic Github actions and build a basic JavaScript rater and underwriter plugin.

The easiest way to get started running tests is to run against the `expected-rates.json` file in the tests folder. The `testrater.js` file is setup to look for this when run with `--runAll`. 
```node testrater.js --runAll```

Alternatively, `testrater.js` can be run with specific payloads.
```node testrater.js --project main_config --product simple-auto --payload tests/basic-single-exposure.json```

This package also comes with `testunderwriter.js` which works identically to `testrater.js`.

Creating payloads is a relatively simple process. Obtain a response from a policy creation request, store it as `payload.json` and run `testutil.js`, it will create a `destination.json` file that can be renamed appropriately and placed in the `tests` folder. This util file wraps the payload in an object which dictates the action along with `policyExposurePerils` which links the peril locators to their appropriate exposure.

The included `deploy.py` file can be used for deploying to sandbox instances. By default, it will only deploy if tests from `testrater.js` pass.

```python3 deploy.py -t TENANTNAME -f main_config -u USERNAME -p PASSWORD```
