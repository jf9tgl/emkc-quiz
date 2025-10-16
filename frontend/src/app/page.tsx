import Link from "next/link";
import { Settings, Monitor, Trophy, Bell } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="text-yellow-500" size={48} />
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                            クイズシステム
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600">
                        Arduino 早押しクイズシステム - 尚美展
                    </p>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Admin Card */}
                    <Link href="/admin">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200 hover:border-blue-300 cursor-pointer group">
                            <div className="text-center">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                    <Settings
                                        className="text-blue-600"
                                        size={32}
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    管理画面
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    問題の設定、クイズの進行、正誤判定を行います
                                </p>
                                <div className="text-blue-600 font-medium group-hover:text-blue-700">
                                    管理画面を開く →
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Display Card */}
                    <Link href="/display">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200 hover:border-purple-300 cursor-pointer group">
                            <div className="text-center">
                                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                                    <Monitor
                                        className="text-purple-600"
                                        size={32}
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    表示画面
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    プロジェクター・大画面に映す参加者用画面です
                                </p>
                                <div className="text-purple-600 font-medium group-hover:text-purple-700">
                                    表示画面を開く →
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Buzzer Card */}
                    <Link href="/buzzer">
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200 hover:border-green-300 cursor-pointer group">
                            <div className="text-center">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                                    <Bell
                                        className="text-green-600"
                                        size={32}
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                    早押しボタン
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    タブレット・スマホで早押しボタンを操作します
                                </p>
                                <div className="text-green-600 font-medium group-hover:text-green-700">
                                    ボタン画面を開く →
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Features */}
                <div className="mt-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        主な機能
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                                タブレット早押し
                            </h4>
                            <p className="text-gray-600 text-sm">
                                物理ボタン不要！タブレットで早押し対応
                            </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                                リアルタイム更新
                            </h4>
                            <p className="text-gray-600 text-sm">
                                WebSocket で全画面が同期更新
                            </p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">
                                スコア管理
                            </h4>
                            <p className="text-gray-600 text-sm">
                                自動スコア計算と手動調整が可能
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
