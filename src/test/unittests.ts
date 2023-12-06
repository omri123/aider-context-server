import * as assert from 'assert';
// import dedent = require("dedent")
import { dedent } from 'ts-dedent';
import * as utils from '../utils';


suite('utils-tests', function () {
    test('format chunk', function () {
        const diff = dedent`
        diff --git a/a.txt b/a.txt
        index 71ac1b5..3816c41 100644
        --- a/a.txt
        +++ b/a.txt
        @@ -4,3 +4,3 @@ a
         d
        -e
        +ee
         f`

        const expected = dedent`
        AIDER_FENCE_0
        a.txt
        <<<<<<< SEARCH
        d
        e
        f
        =======
        d
        ee
        f
        >>>>>>> REPLACE
        AIDER_FENCE_1
        
        
        `

        assert.equal(utils.formatDiff(diff), expected);
    });

    test('format multiple chunks', function () {
        const diff = dedent`
        diff --git a/a.txt b/a.txt
        index 3816c41..66cb076 100644
        --- a/a.txt
        +++ b/a.txt
        @@ -1,2 +1,2 @@
        -a
        +aa
         b
        @@ -7,2 +7,2 @@ f
         g
        -h
        +hh`



        const expected = dedent`
        AIDER_FENCE_0
        a.txt
        <<<<<<< SEARCH
        a
        b
        =======
        aa
        b
        >>>>>>> REPLACE
        AIDER_FENCE_1
        
        AIDER_FENCE_0
        a.txt
        <<<<<<< SEARCH
        g
        h
        =======
        g
        hh
        >>>>>>> REPLACE
        AIDER_FENCE_1
        
        
        `

        assert.equal(utils.formatDiff(diff), expected);
    });

    test('format multiple files', function () {
        const diff = dedent`
        diff --git a/file-a.txt b/file-a.txt
        index 422c2b7..ad71d57 100644
        --- a/file-a.txt
        +++ b/file-a.txt
        @@ -1,2 +1,2 @@
        -a
        +aa
         b
        diff --git a/file-b.txt b/file-b.txt
        index 422c2b7..6ed361c 100644
        --- a/file-b.txt
        +++ b/file-b.txt
        @@ -1,2 +1,2 @@
         a
        -b
        +bb`



        const expected = dedent`
        AIDER_FENCE_0
        file-a.txt
        <<<<<<< SEARCH
        a
        b
        =======
        aa
        b
        >>>>>>> REPLACE
        AIDER_FENCE_1
        
        AIDER_FENCE_0
        file-b.txt
        <<<<<<< SEARCH
        a
        b
        =======
        a
        bb
        >>>>>>> REPLACE
        AIDER_FENCE_1
        
        
        `

        assert.equal(utils.formatDiff(diff), expected);
    });

    test('format file deletion', function () {
        const diff = dedent`
        diff --git a/file-a.txt b/file-a.txt
        deleted file mode 100644
        index ad71d57..0000000
        --- a/file-a.txt
        +++ /dev/null
        @@ -1,2 +0,0 @@
        -a
        -b`

        const expected = dedent`
        AIDER_FENCE_0
        file-a.txt
        <<<<<<< SEARCH
        a
        b
        =======
        >>>>>>> REPLACE
        AIDER_FENCE_1
        
        
        `

        assert.equal(utils.formatDiff(diff), expected);
    });

    test('format file addition', function () {
        const diff = dedent`
            diff --git a/a.txt b/a.txt
            new file mode 100644
            index 0000000..71ac1b5
            --- /dev/null
            +++ b/a.txt
            @@ -0,0 +1,2 @@
            +a
            +b`

        const expected = dedent`
            AIDER_FENCE_0
            a.txt
            <<<<<<< SEARCH
            =======
            a
            b
            >>>>>>> REPLACE
            AIDER_FENCE_1
            
            
            `

        assert.equal(utils.formatDiff(diff), expected);
    });

    test('format file move', function () {
        const diff = dedent`
        diff --git a/a.txt b/file.txt
        similarity index 85%
        rename from a.txt
        rename to file.txt
        index 66cb076..ee628f6 100644
        --- a/a.txt
        +++ b/file.txt
        @@ -3,3 +3,3 @@ b
         c
        -d
        +dd
         ee`

        const expected = dedent`
        AIDER_FENCE_0
        a.txt -> file.txt
        <<<<<<< SEARCH
        c
        d
        ee
        =======
        c
        dd
        ee
        >>>>>>> REPLACE
        AIDER_FENCE_1
        
        
        `

        assert.equal(utils.formatDiff(diff), expected);
    });

    // test('find files language', function () {
    //     assert.fail();
    // });
});

