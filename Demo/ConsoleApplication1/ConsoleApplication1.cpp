// ConsoleApplication1.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <iostream>
using namespace std;

int main()
{
    int myData[5];
    cout << "Default value of myData[2]: " << myData[2] << endl;

    cout << "Size of array: " << sizeof(myData) / sizeof(int) << endl;

    char name[6] = "Dante";

    char name2[20] = "My name is ";

    strcat_s(name2, name);

    cout << name2 << endl;
}

