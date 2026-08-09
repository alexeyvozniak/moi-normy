import WidgetKit
import SwiftUI

private let appGroupID = "group.github.alexeyvozniak.pravilo"
private let sharedStateKey = "pravilo_state_json"
private let openURL = URL(string: "https://alexeyvozniak.github.io/moi-normy/")!

private struct PraviloState: Decodable {
    struct Item: Decodable {
        let id: String?
        let debt: Double?
        let paused: Bool?
    }
    struct History: Decodable {
        let day: String?
        let itemId: String?
        let type: String?
    }
    let items: [Item]?
    let history: [History]?
}

struct PraviloEntry: TimelineEntry {
    let date: Date
    let active: Int
    let withDebt: Int
    let closedToday: Int
}

struct PraviloProvider: TimelineProvider {
    func placeholder(in context: Context) -> PraviloEntry {
        PraviloEntry(date: .now, active: 3, withDebt: 2, closedToday: 1)
    }

    func getSnapshot(in context: Context, completion: @escaping (PraviloEntry) -> Void) {
        completion(readEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PraviloEntry>) -> Void) {
        let entry = readEntry()
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now.addingTimeInterval(1800)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func readEntry() -> PraviloEntry {
        guard
            let json = UserDefaults(suiteName: appGroupID)?.string(forKey: sharedStateKey),
            let data = json.data(using: .utf8),
            let state = try? JSONDecoder().decode(PraviloState.self, from: data)
        else {
            return PraviloEntry(date: .now, active: 0, withDebt: 0, closedToday: 0)
        }

        let items = state.items ?? []
        let active = items.filter { !($0.paused ?? false) }.count
        let withDebt = items.filter { !($0.paused ?? false) && ($0.debt ?? 0) > 0 }.count

        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        let today = formatter.string(from: .now)

        let closedIDs = Set((state.history ?? [])
            .filter { $0.day == today && $0.type == "close" }
            .compactMap { $0.itemId })

        return PraviloEntry(date: .now, active: active, withDebt: withDebt, closedToday: closedIDs.count)
    }
}

struct PraviloWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PraviloEntry

    private let paper = Color(red: 0.984, green: 0.969, blue: 0.941)
    private let ink = Color(red: 0.106, green: 0.094, blue: 0.078)
    private let muted = Color(red: 0.43, green: 0.40, blue: 0.36)
    private let red = Color(red: 0.74, green: 0.35, blue: 0.26)
    private let green = Color(red: 0.41, green: 0.45, blue: 0.37)

    var body: some View {
        ZStack {
            paper
            VStack(alignment: .leading, spacing: family == .systemSmall ? 10 : 12) {
                HStack {
                    Text("Правило")
                        .font(.system(.title3, design: .serif).weight(.medium))
                        .foregroundStyle(ink)
                    Spacer()
                    Circle()
                        .fill(red)
                        .frame(width: 13, height: 13)
                }

                if family == .systemSmall {
                    statRow(label: "с долгом", value: entry.withDebt, accent: red)
                    statRow(label: "закрыто", value: entry.closedToday, accent: green)
                } else {
                    HStack(spacing: 18) {
                        statBlock(label: "активных", value: entry.active, accent: green)
                        statBlock(label: "с долгом", value: entry.withDebt, accent: red)
                        statBlock(label: "закрыто", value: entry.closedToday, accent: ink)
                    }
                }

                Spacer(minLength: 0)
                Text("Открыть правило")
                    .font(.caption2)
                    .foregroundStyle(muted)
            }
            .padding(15)
        }
        .widgetURL(openURL)
        .containerBackground(for: .widget) { paper }
    }

    private func statRow(label: String, value: Int, accent: Color) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text("\(value)")
                .font(.system(size: 30, weight: .medium, design: .serif))
                .foregroundStyle(accent)
            Text(label)
                .font(.caption2)
                .foregroundStyle(muted)
        }
    }

    private func statBlock(label: String, value: Int, accent: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(value)")
                .font(.system(size: 28, weight: .medium, design: .serif))
                .foregroundStyle(accent)
            Text(label)
                .font(.caption2)
                .foregroundStyle(muted)
        }
    }
}

struct PraviloWidget: Widget {
    let kind = "PraviloWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PraviloProvider()) { entry in
            PraviloWidgetView(entry: entry)
        }
        .configurationDisplayName("Правило")
        .description("Показывает активные нормы, долг и закрытые нормы сегодня.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct PraviloWidgetBundle: WidgetBundle {
    var body: some Widget {
        PraviloWidget()
    }
}
