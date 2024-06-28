# Plugin Config Page Documentation

## Dev Notes

This vue application is used for [excel-mapper-plugin](https://github.com/aulyaAQI/excel-mapper-plugin)
To modify the plugin config page, you need to:

1. Build the config.js file. On this root:

   ```
   npm run build
   ```

2. Copy the config.js to your plugin directory.
3. Rebuild the plugin (please refer to auto-assign-plugin docs).

## Overview

The Plugin Config Page is a crucial component of the Excel Mapper Plugin. It allows users to configure various settings and parameters for the plugin's functionality. This document provides specifications for the Plugin Config Page, including its layout, features, and usage instructions.

## Purpose

The purpose of this document is to outline the requirements and functionality of the Excel Mapper Plugin Config Page.

## Scope

The scope of this document includes the design, layout, and features of the Excel Mapper Plugin Config Page.

## Features

1. Import Excel file: Users should be able to import an Excel file for mapping.
2. Mapping Configuration: Users should be able to define the mapping between Excel columns and kintone fields.
3. Preview: Users should be able to preview the mapped data before saving.
4. Save Configuration: Users should be able to save the mapping configuration for future use.
5. Error Handling: Proper error messages should be displayed for invalid mappings or file formats.

## User Interface

The user interface of the Excel Mapper Plugin Config Page should be intuitive and user-friendly. It should include clear instructions and error messages to guide the user through the mapping process.

## Constraints

- The Excel Mapper Plugin Config Page should be compatible with the kintone plugin development framework.
- The Excel file should be in a supported format (e.g., .xlsx, .csv).
- The mapping configuration should be saved in a persistent storage.

## Dependencies

- The Excel Mapper Plugin Config Page depends on the kintone plugin development framework.
- The Excel Mapper Plugin Config Page requires access to the user's file system to import Excel files.
