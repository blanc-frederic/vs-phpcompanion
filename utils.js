var path = require("path");

module.exports = {
    getClassNameFromPath: function (filePath) {
        return path.basename(filePath).replace(".php", "")
    },
    getNamespaceFromPath: function (filePath) {
        let className = this.getClassNameFromPath(filePath)

        filePath = filePath.replace(".php", "");

        let pathElements = filePath.split(path.sep);

        let srcIndex = pathElements.lastIndexOf("src");

        let indexAddition = 1;

        if (srcIndex == -1) {
            srcIndex = pathElements.lastIndexOf("tests");
        }

        // src dir not found so use it might be Laravel (use app directory instead of src)
        if (srcIndex === -1) {
            srcIndex = pathElements.lastIndexOf("app");
            indexAddition = 0;
        }

        let namespaceElements = pathElements.slice(srcIndex + indexAddition,
            pathElements.lastIndexOf(className)).map(pathElement => {
                // every namespace need to be capitalized
                return pathElement.charAt(0).toUpperCase() + pathElement.slice(1);
            })

        return {
            isLaravel: (indexAddition == 0) ? true : false,
            ns: namespaceElements.join("\\")
        };
    },
    generateCode: function (filePath, prefix = "class", nsVendor = "") {
        let ns = this.getNamespaceFromPath(filePath)
        let cn = this.getClassNameFromPath(filePath)

        let namespace = ns.ns

        if (nsVendor.length > 1 && !ns.isLaravel) {
            namespace = nsVendor + "\\" + namespace
        }

        return `<?php

declare(strict_types=1);

namespace ${namespace};

${prefix} ${cn}
{
}
`;
    }
}
