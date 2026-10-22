package ir.seghalam.food

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.modules.i18nmanager.I18nUtil

/**
 * React Native 0.87 host implementation based on the official 0.87-stable template.
 * Keep exactly one MainApplication in the Android source set.
 */
class MainApplication : Application(), ReactApplication {
    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            packageList = PackageList(this).packages,
        )
    }

    override fun onCreate() {
        super.onCreate()
        I18nUtil.getInstance().allowRTL(applicationContext, true)
        I18nUtil.getInstance().forceRTL(applicationContext, true)
        loadReactNative(this)
    }
}
