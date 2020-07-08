# Contributing

First of all, thanks for taking the time to contribute! :+1:

## How Can I Contribute?

Report bugs and suggest improvements. If something doesn't work well for you or can be done better, please let us know! When you are creating a new issue, fill out the issue template, the information it asks for helps us resolve issues faster.

## Create New Rule

- Create a new file for the rule implementation in `src/rules`. File name should be lowercased, words must be separated by dashes (`-`).
- Create a test file `<rule name>.test.ts` in `test/rules`.
- Add the rule to `src/index.ts`.
- In folder `docs/rules` create a rule documentation file `<rule name>.md`
- In `README.md` add a reference to this documentation file.
- Run [Ruling](#ruling) test.

## Testing

To run unit tests:

```
yarn test
```

To run unit tests in watch mode:

```
yarn test --watch
```

And finally to run unit tests with coverage:

```
yarn test --coverage
```

## <a name="ruling"></a>Ruling

The ruling test is a special integration test which launches the analysis of a large code base,
and then compares those results to the set of expected issues (stored as snapshot files).
To have this code base locally:

```sh
git submodule update --init --recursive
```

To run the ruling test:

```sh
yarn ruling
yarn ruling --rule <rule-file-name> # to run ruling for a single rule
yarn ruling --update # to update the snapshots
yarn ruling --rule <rule-file-name> --update # it is possible to combine both options
```

## Code Style

We're using Prettier to format the code, the options are in `package.json`.
