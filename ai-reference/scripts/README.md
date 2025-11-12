# Testing Scripts

This directory contains automation scripts for testing the JustDeen MyCompanion app.

## iPhone Testing Script

### Overview

The `test-on-iphone.sh` script automates the entire process of building, installing, and launching the app on a physical iPhone device for testing.

### Prerequisites

1. **Xcode** installed with command line tools
2. **iPhone connected** via USB cable
3. **Device trusted** on your Mac
4. **Developer mode enabled** on iPhone (Settings > Privacy & Security > Developer Mode)

### Usage

#### Basic Usage (Auto-detect device)

```bash
./ai-reference/scripts/test-on-iphone.sh
```

This will:
1. Detect your connected iPhone automatically
2. Build the iOS app using xcodebuild
3. Install the app on your device
4. Start the Metro bundler in the background
5. Launch the app on your iPhone

#### Specify Device Name

```bash
./ai-reference/scripts/test-on-iphone.sh "Husain's iPhone"
```

#### Specify Device UDID

```bash
./ai-reference/scripts/test-on-iphone.sh 00008140-001C2CC83A02801C
```

#### Stop Metro Bundler

```bash
./ai-reference/scripts/test-on-iphone.sh --stop-metro
```

#### Show Help

```bash
./ai-reference/scripts/test-on-iphone.sh --help
```

### What the Script Does

1. **Device Detection**: Automatically detects connected iPhone devices using `xcrun devicectl`
2. **Build**: Compiles the iOS app using xcodebuild with your workspace
3. **Install**: Installs the built .app bundle on your device
4. **Metro**: Starts the Expo Metro bundler in development client mode
5. **Launch**: Launches the app on your device

### Output

The script provides colored output:
- **Blue** - Step information
- **Green** - Success messages
- **Yellow** - Warnings
- **Red** - Error messages

### Logs

Metro bundler logs are saved to `metro.log` in the project root.

### Troubleshooting

#### Device Not Found

**Error**: "No iPhone devices found"

**Solution**:
- Ensure iPhone is connected via USB
- Trust this computer on your iPhone
- Check cable connection
- Run `xcrun devicectl list devices` to verify device is detected

#### Build Failed

**Error**: "Build failed. Check the errors above."

**Solution**:
- Check Xcode for build errors
- Ensure all dependencies are installed: `npm install` and `cd ios && pod install`
- Clean build folder in Xcode
- Check signing certificates

#### Installation Failed

**Error**: "Installation failed"

**Solution**:
- Ensure device is unlocked
- Check Developer Mode is enabled on iPhone
- Verify bundle identifier is correct
- Check device storage space

#### Metro Already Running

**Warning**: "Metro bundler already running on port 8081"

**Solution**: This is just a warning. The existing Metro instance will be used.

To stop it manually:
```bash
./ai-reference/scripts/test-on-iphone.sh --stop-metro
```

Or kill the process:
```bash
lsof -ti :8081 | xargs kill
```

### Script Configuration

The script uses these default configurations (edit the script to change):

- **Workspace**: `ios/JustDeenMyCompanion.xcworkspace`
- **Scheme**: `JustDeenMyCompanion`
- **Bundle ID**: `com.husainshah.justdeen`
- **Build Config**: `Debug`

### Advanced Options

#### Clean Build

Uncomment the clean command in the script (line ~120):

```bash
xcodebuild clean -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration "$BUILD_CONFIG"
```

This will clean previous builds before building (slower but more reliable).

#### Build Only (No Install/Launch)

Comment out the install, metro, and launch steps in the `main()` function.

### Examples

**Quick test on auto-detected device:**
```bash
./ai-reference/scripts/test-on-iphone.sh
```

**Test on specific device:**
```bash
./ai-reference/scripts/test-on-iphone.sh "Husain's iPhone"
```

**Stop Metro when done:**
```bash
./ai-reference/scripts/test-on-iphone.sh --stop-metro
```

### Integration with Development Workflow

You can add this script to your package.json for easier access:

```json
{
  "scripts": {
    "test:iphone": "./ai-reference/scripts/test-on-iphone.sh",
    "test:stop": "./ai-reference/scripts/test-on-iphone.sh --stop-metro"
  }
}
```

Then run:
```bash
npm run test:iphone
npm run test:stop
```

## Future Scripts

Additional testing scripts will be added here:
- `test-on-simulator.sh` - Test on iOS Simulator
- `test-on-android.sh` - Test on Android device
- `run-tests.sh` - Run automated test suites
