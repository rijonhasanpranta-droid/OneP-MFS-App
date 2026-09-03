# 🚀 OneP MFS - Flutter User App | Home Screen

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // ওয়ালেট ব্যালেন্স লোড করা
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<WalletProvider>(context, listen: false).getBalance();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OneP - MFS'),
        backgroundColor: Colors.blue[900],
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ===================== ব্যালেন্স কার্ড =====================
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.blue[900]!, Colors.blue[700]!],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Consumer<WalletProvider>(
                builder: (context, walletProvider, _) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'মোট ব্যালেন্স',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${walletProvider.balance.toStringAsFixed(2)} টাকা',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'আজ পাঠানো',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                '${walletProvider.dailySentToday.toStringAsFixed(2)} টাকা',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text(
                                'দৈনিক লিমিট',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              Text(
                                '${walletProvider.dailyLimit.toStringAsFixed(2)} টাকা',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  );
                },
              ),
            ),

            // ===================== প্রধান অপশন মেনু =====================
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                children: [
                  // পাঠান
                  _buildMenuCard(
                    icon: Icons.send,
                    title: 'পাঠান',
                    color: Colors.blue,
                    onTap: () {
                      Navigator.pushNamed(context, '/send-money');
                    },
                  ),
                  // টাকা যোগ করুন
                  _buildMenuCard(
                    icon: Icons.add_circle,
                    title: 'টাকা যোগ করুন',
                    color: Colors.green,
                    onTap: () {
                      Navigator.pushNamed(context, '/cash-in');
                    },
                  ),
                  // টাকা তুলুন
                  _buildMenuCard(
                    icon: Icons.money,
                    title: 'টাকা তুলুন',
                    color: Colors.orange,
                    onTap: () {
                      Navigator.pushNamed(context, '/cash-out');
                    },
                  ),
                  // বিল পরিশোধ
                  _buildMenuCard(
                    icon: Icons.receipt,
                    title: 'বিল পরিশোধ',
                    color: Colors.purple,
                    onTap: () {
                      Navigator.pushNamed(context, '/bill-pay');
                    },
                  ),
                  // মোবাইল রিচার্জ
                  _buildMenuCard(
                    icon: Icons.phone_android,
                    title: 'রিচার্জ',
                    color: Colors.red,
                    onTap: () {
                      Navigator.pushNamed(context, '/recharge');
                    },
                  ),
                  // হিস্ট্রি
                  _buildMenuCard(
                    icon: Icons.history,
                    title: 'হিস্ট্রি',
                    color: Colors.teal,
                    onTap: () {
                      Navigator.pushNamed(context, '/transaction-history');
                    },
                  ),
                ],
              ),
            ),

            // ===================== সাম্প্রতিক লেনদেন =====================
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'সাম্প্রতিক লেনদেন',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Consumer<TransactionProvider>(
                    builder: (context, txnProvider, _) {
                      return ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: txnProvider.recentTransactions.length,
                        itemBuilder: (context, index) {
                          final txn = txnProvider.recentTransactions[index];
                          return Card(
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: txn.type == 'SEND'
                                    ? Colors.red[100]
                                    : Colors.green[100],
                                child: Icon(
                                  txn.type == 'SEND'
                                      ? Icons.arrow_upward
                                      : Icons.arrow_downward,
                                  color: txn.type == 'SEND'
                                      ? Colors.red
                                      : Colors.green,
                                ),
                              ),
                              title: Text(txn.description ?? 'Transfer'),
                              subtitle: Text(txn.createdAt.toString()),
                              trailing: Text(
                                '${txn.type == "SEND" ? "-" : "+"}${txn.amount}',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: txn.type == 'SEND'
                                      ? Colors.red
                                      : Colors.green,
                                ),
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          border: Border.all(color: color, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: color),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 📱 Wallet Provider (State Management)

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class WalletProvider extends ChangeNotifier {
  final ApiService apiService;
  
  double balance = 0;
  double dailyLimit = 0;
  double monthlyLimit = 0;
  double dailySentToday = 0;
  bool isLocked = false;
  
  WalletProvider(this.apiService);
  
  // ব্যালেন্স লোড করা
  Future<void> getBalance() async {
    try {
      final response = await apiService.get('/wallet/balance');
      balance = (response['balance'] ?? 0).toDouble();
      dailyLimit = (response['daily_limit'] ?? 0).toDouble();
      monthlyLimit = (response['monthly_limit'] ?? 0).toDouble();
      dailySentToday = (response['daily_sent_today'] ?? 0).toDouble();
      isLocked = response['is_locked'] ?? false;
      notifyListeners();
    } catch (e) {
      print('ব্যালেন্স লোড ব্যর্থ: $e');
    }
  }
}
```

---

## 🔄 API Service

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final Dio dio;
  final secureStorage = const FlutterSecureStorage();
  
  static const String baseUrl = 'https://api.onep.com/api/v1';
  
  ApiService(this.dio) {
    dio.options.baseUrl = baseUrl;
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // JWT Token add করা
        final token = await secureStorage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token মেয়াদ শেষ - Re-login
          // navigateToLogin();
        }
        return handler.next(error);
      },
    ));
  }
  
  Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await dio.get(endpoint);
    return response.data;
  }
  
  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    final response = await dio.post(endpoint, data: data);
    return response.data;
  }
}
```
