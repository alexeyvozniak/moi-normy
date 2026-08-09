import SwiftUI
import WebKit
import WidgetKit

private let appGroupID = "group.github.alexeyvozniak.pravilo"
private let sharedStateKey = "pravilo_state_json"
private let praviloURL = URL(string: "https://alexeyvozniak.github.io/moi-normy/")!

@main
struct PraviloApp: App {
    var body: some Scene {
        WindowGroup {
            PraviloWebView()
                .ignoresSafeArea()
        }
    }
}

struct PraviloWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let controller = WKUserContentController()
        controller.add(context.coordinator, name: "praviloSync")

        let bridge = #"""
        (() => {
          const send = () => {
            try {
              window.webkit.messageHandlers.praviloSync.postMessage(localStorage.getItem('pravilo_v1') || '');
            } catch (_) {}
          };
          const original = Storage.prototype.setItem;
          Storage.prototype.setItem = function(key, value) {
            original.apply(this, arguments);
            if (this === localStorage && key === 'pravilo_v1') send();
          };
          window.addEventListener('load', send);
          document.addEventListener('visibilitychange', () => { if (!document.hidden) send(); });
          setTimeout(send, 600);
        })();
        """#
        controller.addUserScript(WKUserScript(source: bridge, injectionTime: .atDocumentEnd, forMainFrameOnly: true))

        let configuration = WKWebViewConfiguration()
        configuration.userContentController = controller
        configuration.websiteDataStore = .default()

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.load(URLRequest(url: praviloURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler {
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "praviloSync", let json = message.body as? String, !json.isEmpty else { return }
            UserDefaults(suiteName: appGroupID)?.set(json, forKey: sharedStateKey)
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}
