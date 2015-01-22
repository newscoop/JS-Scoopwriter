# Contributing

This document describes how you can contribute to the project to make it even
better.:wink:

# General Steps

The steps needed to add your work can be summarized as follows:

* Fork the repository, clone the fork and install the application
([instructions](README.md#gettingStarted)).
* Create a new topic branch, e.g.:
```
    $ git checkout -b my-new-feature
```
* Make your changes in the branch and commit them.
* Perform a [code quality check](#codeQuality) (if haven't done so already in
the previous step) and make any improvements necessary.
* Push your quality changes to your forked repository fork and send a pull
request to the main repository.
* Give the project maintainers some time to review your code. If everything was
done right and your pull request is approved, it will be merged into the main
respository and you can give yourself a _high five_. :hand: :smiley:

NOTE: Before sending a pull request, it is recommended that you incorporate the
latest changes from the main repository's master branch into your topic branch
(either by merging them or rebasing the topic branch onto the latest version
of master). This reduces the probability of code conflicts when your pull
request is ready to be merged.

# <a name="codeQuality"></a>Quality Check

Before submitting your changes, please make sure that your code is of a good
standard as it makes it easier for other people to understand and build upon
it and helps with the long-term maintenance of the project.

## Tests

All new code and bug fixes must be submitted with accompanying tests. To verify
that new changes did not accidentally break something, run the following
command in console:

    $ grunt test

All tests must pass and you also have to make sure that the changes you
introduced are covered by tests as well. Run the tests with coverage reports
enabled and check the reports to verify that all possible code execution paths
have been covered.

Check the section on [code coverage](README.md#testCoverage) reports if you
don't yet know how to enable them.

## Static Code Analysis and Style Check

You can statically analyze the code (i.e. without executing it) by running the
following command:

    $ grunt jshint

The `jshint` utility will parse the code and warn you if it finds any potential
problems in it, i.e. quirky things that might result in a bug. Make sure that
it issues no warnings, including those related to coding style. Having a
consistent style across the application helps with code readability and
maintenance.

## Code Comments

Please invest a few extra minutes of your development time to add proper
comments to the code you write, as it will considerably help other developers
to understand your work and the rationale behind the decisions you made.

The project uses [JSDoc](http://usejsdoc.org/)-style comments for function and
module annotations. You can check the existing codebase for examples, there
are plenty of them.
