describe("Suite", function() {

  it("keeps its id", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        id: 456,
        description: "I am a suite"
      });

    expect(suite.id).toEqual(456);
  });

  it("returns its full name", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      });

    expect(suite.getFullName()).toEqual("I am a suite");
  });

  it("returns its full name when it has parent suites", function() {
    var env = new jasmine.Env(),
      parentSuite = new jasmine.Suite({
        env: env,
        description: "I am a parent suite",
        parentSuite: jasmine.createSpy('pretend top level suite')
      }),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite",
        parentSuite: parentSuite
      });

    expect(suite.getFullName()).toEqual("I am a parent suite I am a suite");
  });

  it("adds before functions in order of needed execution", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      }),
      outerBefore = jasmine.createSpy('outerBeforeEach'),
      innerBefore = jasmine.createSpy('insideBeforeEach');

    suite.beforeEach(outerBefore);
    suite.beforeEach(innerBefore);

    expect(suite.beforeFns).toEqual([innerBefore, outerBefore]);
  });

  it("adds after functions in order of needed execution", function() {
    var env = new jasmine.Env(),
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite"
      }),
      outerAfter = jasmine.createSpy('outerAfterEach'),
      innerAfter = jasmine.createSpy('insideAfterEach');

    suite.afterEach(outerAfter);
    suite.afterEach(innerAfter);

    expect(suite.afterFns).toEqual([innerAfter, outerAfter]);
  });

  it("adds specs", function() {
    var env = new jasmine.Env(),
      fakeQueue = {
        add: jasmine.createSpy()
      },
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite",
        queueFactory: function() {
          return fakeQueue
        }
      }),
      fakeSpec = {};

    expect(suite.specs.length).toEqual(0);

    suite.addSpec(fakeSpec);

    expect(suite.specs.length).toEqual(1);
  });

  it("adds suites", function() {
    var env = new jasmine.Env(),
      fakeQueue = {
        add: jasmine.createSpy()
      },
      suite = new jasmine.Suite({
        env: env,
        description: "I am a suite",
        queueFactory: function() {
          return fakeQueue
        }
      }),
      anotherSuite = new jasmine.Suite({
        env: env,
        description: "I am another suite",
        queueFactory: function() {
          return fakeQueue
        }
      });

    expect(suite.suites.length).toEqual(0);

    suite.addSuite(anotherSuite);

    expect(suite.suites.length).toEqual(1);
  });

  it("can be disabled", function() {
    var env = new jasmine.Env(),
      fakeQueueRunner = jasmine.createSpy('fake queue runner'),
      suite = new jasmine.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner
      });

    suite.disable();

    expect(suite.disabled).toBe(true);

    suite.execute();

    expect(fakeQueueRunner).not.toHaveBeenCalled();
  });

  it("delegates execution of its specs and suites", function() {
    var env = new jasmine.Env(),
      parentSuiteDone = jasmine.createSpy('parent suite done'),
      fakeQueueRunnerForParent = jasmine.createSpy('fake parent queue runner'),
      parentSuite = new jasmine.Suite({
        env: env,
        description: "I am a parent suite",
        queueRunner: fakeQueueRunnerForParent
      }),
      fakeQueueRunner = jasmine.createSpy('fake queue runner'),
      suite = new jasmine.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1')
      };

    spyOn(suite, "execute");

    parentSuite.addSpec(fakeSpec1);
    parentSuite.addSuite(suite);

    parentSuite.execute(parentSuiteDone);

    var parentSuiteFns = fakeQueueRunnerForParent.mostRecentCall.args[0].fns;

    parentSuiteFns[0]();
    expect(fakeSpec1.execute).toHaveBeenCalled();
    parentSuiteFns[1]();
    expect(suite.execute).toHaveBeenCalled();
  });

  it("calls a provided onStart callback when starting", function() {
    var env = new jasmine.Env(),
      suiteStarted = jasmine.createSpy('suiteStarted'),
      fakeQueueRunner = function(attrs) { attrs.onComplete(); },
      suite = new jasmine.Suite({
        env: env,
        description: "with a child suite",
        onStart: suiteStarted,
        queueRunner: fakeQueueRunner
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1')
      };

    suite.execute();

    expect(suiteStarted).toHaveBeenCalledWith(suite);
  });

  it("calls a provided onComplete callback when done", function() {
    var env = new jasmine.Env(),
      suiteCompleted = jasmine.createSpy('parent suite done'),
      fakeQueueRunner = function(attrs) { attrs.onComplete(); },
      suite = new jasmine.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1')
      };

    suite.execute(suiteCompleted);

    expect(suiteCompleted).toHaveBeenCalled();
  });

  it("calls a provided result callback when done", function() {
    var env = new jasmine.Env(),
      suiteResultsCallback = jasmine.createSpy('suite result callback'),
      fakeQueueRunner = function(attrs) { attrs.onComplete(); },
      suite = new jasmine.Suite({
        env: env,
        description: "with a child suite",
        queueRunner: fakeQueueRunner,
        resultCallback: suiteResultsCallback
      }),
      fakeSpec1 = {
        execute: jasmine.createSpy('fakeSpec1')
      };

    suite.execute();

    expect(suiteResultsCallback).toHaveBeenCalledWith({
      id: suite.id,
      status: '',
      description: "with a child suite",
      fullName: "with a child suite"
    });
  });
});
